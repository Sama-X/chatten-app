"""
api service.
"""
from datetime import date, datetime, time, timedelta
import json
import re
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.db.models import Sum, F, Q, Count
from django.db.models.functions import Coalesce
from django.utils.translation import gettext as _

from django_redis import get_redis_connection

from asset.models import O2OPaymentModel, PointsModel, PointsWithdrawModel
from asset.service import O2OPaymentService
from base.common import CommonUtil
from base.exception import SystemErrorCode, UserErrorCode
from base.response import APIResponse, SerializerErrorResponse

from base.sama import SamaClient
from base.service import BaseService
from chat.models import ChatRecordModel
from order.models import OrderModel
from users.admin.serializer import ConfigSeriazlier, InviteLogSerializer, UpdateConfigSerializer
from users.models import (
    AccountModel, ConfigModel, InviteLogModel, SamaScoreLogModel, SamaScoreModel,
    SamaWalletModel
)
from users.serializer import UpdateAccountSerializer


class UserService:
    """
    user service.
    """
    SAMA_TASKS_KEY = "sama:task:pending"

    @classmethod
    @transaction.atomic
    def register(cls, username, password, invite_code, user_type=AccountModel.USER_TYPE_ANONY) -> APIResponse:
        """
        register user api.
        """
        need_valid = ConfigModel.get_bool(
            ConfigModel.CONFIG_PHONE_NUMBER_VALIDATION_REQUIRED, False,
            _("Whether to enable the verification rule of mobile phone number")
        )
        if need_valid:
            if not re.match(r'^1\d{10}$', username):
                return APIResponse(code=UserErrorCode.USER_INVALID_MOBILE)

        conn = get_redis_connection()
        with transaction.atomic():
            exists = AccountModel.objects.filter(
                username=username
            ).count() > 0
            if exists:
                return APIResponse(code=UserErrorCode.USER_EXISTS)

            account = AccountModel(
                username=username,
                user_type=user_type
            )
            account.password = password
            account.save()

            if invite_code:
                invite_user_id = CommonUtil.decode_hashids(invite_code)
                exists = AccountModel.objects.filter(pk=invite_user_id).count() > 0
                if exists:
                    invite_reward_count = ConfigModel.get_int(
                        ConfigModel.CONFIG_INVITE_REWARD_COUNT, 10,
                        _("Number of invitations for awards")
                    )
                    O2OPaymentService.add_payment_by_reward(
                        invite_user_id, invite_reward_count, _('Invite user id: %(aid)s and get %(count)s times') % {
                            'aid': account.id,
                            'count': invite_reward_count
                        }
                    )

                    UserServiceHelper.clear_reward_experience_cache(invite_user_id)
                    super_inviter_user_id = None
                    super_inviter = InviteLogModel.objects.only('inviter_user_id').filter(
                        user_id=invite_user_id
                    ).first()
                    if super_inviter:
                        super_inviter_user_id = super_inviter.inviter_user_id

                    InviteLogModel.objects.create(
                        user_id=account.id,
                        inviter_user_id=invite_user_id,
                        super_inviter_user_id=super_inviter_user_id,
                        experience=settings.SHARE_REWARD_EXPERIENCE,
                        expired_time=datetime.now() + timedelta(days=3650)  # ten years
                    )
                    conn.lpush(UserService.SAMA_TASKS_KEY, json.dumps([invite_user_id, 10, None]))

            O2OPaymentService.add_free_payment(account.id)

            conn.lpush(UserService.SAMA_TASKS_KEY, json.dumps([account.id, 10, None]))
            token = CommonUtil.generate_user_token(account.id)

            return APIResponse(result=CommonUtil.generate_login_result(token, account))

    @classmethod
    @transaction.atomic
    def add_score(cls, user_id, amount, chain):
        """
        add score.
        """
        with transaction.atomic():
            obj = SamaScoreModel.objects.filter(user_id=user_id).first()
            if not obj:
                obj = SamaScoreModel(user_id=user_id, balance=0)

            obj.balance += amount
            obj.save()

            wallet_obj = SamaWalletModel.objects.filter(
                user_id=user_id, chain=chain
            ).first()

            if not wallet_obj:
                wallet = SamaClient.create_wallet()
                if wallet.result:
                    wallet_obj = SamaWalletModel(
                        user_id=user_id,
                        address=wallet.address,
                        private_key=wallet.private_key,
                        chain=chain
                    )
                    wallet_obj.save()

            txid, resp = '', ''
            if wallet_obj:
                result = SamaClient.create_transaction_unconfirmed(wallet_obj.address, amount, settings.SAMA_WALLET_PRIVATE)
                resp = result.json()
                if result.result:
                    txid = result.txID

            SamaScoreLogModel.objects.create(
                user_id=user_id, score_id=obj.id,
                category=SamaScoreLogModel.CATEGORY_ADD,
                amount=amount,
                txid=txid,
                result=resp
            )

    @classmethod
    def get_reward_experience(cls, user_id) -> int:
        """
        get user total reward experience times.
        """
        total = UserServiceHelper.get_reward_experience_cache(user_id)
        if total is not None:
            return total

        total = InviteLogModel.objects.filter(
            inviter_user_id=user_id,
            expired_time__gte=datetime.now()
        ).aggregate(total=Coalesce(Sum(F('experience')), 0)).get('total', 0)

        UserServiceHelper.update_reward_experience_cache(user_id, total)

        return total

    @classmethod
    def get_used_experience(cls, user_id, start_time=None) -> int:
        """
        get user used experience times.
        """
        total = UserServiceHelper.get_used_experience_cache(user_id)
        if total is not None:
            return total

        from chat.models import ChatRecordModel
        conditions = {
            'success': True,
            'user_id': user_id
        }
        if start_time:
            conditions.update({
                'question_time__gte': start_time
            })
        current_total = ChatRecordModel.objects.filter(
            **conditions
        ).count() or 0

        UserServiceHelper.update_used_experience_cache(user_id, current_total)

        return current_total

    @classmethod
    def get_user_experience(cls, user_id):
        """
        get user experience.
        """
        total = UserServiceHelper.get_experience_cache(user_id)
        if total is not None:
            return total

        payment_obj = O2OPaymentModel.objects.filter(user_id=user_id).first()
        if not payment_obj:
            payment_obj = O2OPaymentService.add_free_payment(user_id)

        total = payment_obj.free_usage_count + payment_obj.persistence_usage_count + payment_obj.transient_usage_count

        UserServiceHelper.update_experience_cache(user_id, total, 60)

        return total

    @classmethod
    def get_user_points(cls, user_id):
        """
        get user points.
        """
        obj = PointsModel.objects.filter(user_id=user_id).first()
        lock_point = PointsWithdrawModel.objects.filter(
            user_id = user_id, is_delete=False,
            status = PointsWithdrawModel.STATUS_PENDING
        ).aggregate(total=Coalesce(Sum('point'), 0)).get('total', 0)
        if obj:
            return obj.total - lock_point

        return 0

    @classmethod
    def check_given_gift_experience(cls, user_id):
        """
        Check whether the user has given a gift today.
        """
        if UserServiceHelper.had_given_gift_experience(user_id):
            return True

        payment_obj = O2OPaymentModel.objects.filter(user_id=user_id).first()
        if not payment_obj or payment_obj.free_expire_time < datetime.now():
            O2OPaymentService.add_free_payment(user_id)
            UserServiceHelper.update_given_gift_experience(user_id)

    @classmethod
    def update_wechat_info(cls, request):
        """
        update user wechat info.
        """
        serializer = UpdateAccountSerializer(data=request.data)
        if not serializer.is_valid():
            return SerializerErrorResponse(serializer)

        data = serializer.validated_data
        nickname = data['nickname']  # type: ignore
        openid = data['openid']  # type: ignore
        account = AccountModel.objects.get(pk=request.user.id)
        account.nickname = nickname
        account.openid = openid
        account.save()

        return APIResponse()


class UserServiceHelper:
    """
    user service helper.
    """

    EXPERIENCE_USAGE_KEY = "chat:experience:usage:{}:times"
    EXPERIENCE_REWARD_KEY = "chat:experience:reward:{}:times"
    EXPERIENCE_USED_KEY = "chat:experience:used:{}:times"
    EXPERIENCE_TODAY_GIFT = "chat:experience:today:gift:{}"

    @classmethod
    def had_given_gift_experience(cls, user_id):
        """
        Check whether the user has given a gift today.
        """
        key = cls.EXPERIENCE_TODAY_GIFT.format(user_id)
        if cache.has_key(key):
            return True
        else:
            return False

    @classmethod
    def update_given_gift_experience(cls, user_id):
        """
        update had given a gift today.
        """
        key = cls.EXPERIENCE_TODAY_GIFT.format(user_id)
        end = datetime.combine(date.today() + timedelta(days=1), time.min)
        now = datetime.now()

        cache.set(key, 1, int((end - now).total_seconds()))

    @classmethod
    def get_reward_experience_cache(cls, user_id):
        """
        get cache.
        """
        key = cls.EXPERIENCE_REWARD_KEY.format(user_id)
        return cache.get(key)

    @classmethod
    def get_used_experience_cache(cls, user_id):
        """
        get cache.
        """
        key = cls.EXPERIENCE_USED_KEY.format(user_id)
        return cache.get(key)

    @classmethod
    def get_experience_cache(cls, user_id):
        """
        get cache.
        """
        key = cls.EXPERIENCE_USAGE_KEY.format(user_id)
        return cache.get(key)

    @classmethod
    def clear_reward_experience_cache(cls, user_id):
        """
        clear cache.
        """
        key = cls.EXPERIENCE_REWARD_KEY.format(user_id)
        cache.delete(key)

    @classmethod
    def clear_used_experience_cache(cls, user_id):
        """
        clear cache.
        """
        key = cls.EXPERIENCE_USED_KEY.format(user_id)
        cache.delete(key)

    @classmethod
    def clear_experience_cache(cls, user_id):
        """
        clear cache.
        """
        key = cls.EXPERIENCE_USAGE_KEY.format(user_id)
        cache.delete(key)

    @classmethod
    def update_used_experience_cache(cls, user_id, value, expired=7200):
        """
        update cache.
        default: 2 hour cache
        """
        key = cls.EXPERIENCE_USED_KEY.format(user_id)
        cache.set(key, value, expired)

    @classmethod
    def update_reward_experience_cache(cls, user_id, value, expired=7200):
        """
        update cache.
        default: 2 hour cache
        """
        key = cls.EXPERIENCE_REWARD_KEY.format(user_id)
        cache.set(key, value, expired)

    @classmethod
    def update_experience_cache(cls, user_id, value, expired=7200):
        """
        update cache.
        default: 2 hour cache
        """
        key = cls.EXPERIENCE_USAGE_KEY.format(user_id)
        cache.set(key, value, expired)


class ConfigService:
    """
    config service.
    """
    @classmethod
    def check_order_fields(cls, clz, fields):
        """
        check order field.
        """
        new_fields = []
        for field in fields:
            new_field = field.replace('-', '')
            if hasattr(clz, new_field):
                new_fields.append(field)

        return new_fields

    @classmethod
    def get_list(cls, page, offset, order) -> APIResponse:
        """
        get config list.
        """
        base = ConfigModel.objects.filter(is_delete=False)
        total = base.count()
        order_fields = cls.check_order_fields(
            ConfigModel, [item.strip() for item in order.split(',') if item and item.strip()]
        )
        objs = base.order_by(*order_fields)[(page - 1) * offset: page * offset].all()

        serializer = ConfigSeriazlier(objs, many=True)

        return APIResponse(result=serializer.data, count=total)

    @classmethod
    def update(cls, config_id, request):
        """
        update config.
        """
        serializer = UpdateConfigSerializer(data=request.data)
        if not serializer.is_valid():
            return SerializerErrorResponse(serializer, code=SystemErrorCode.PARAMS_INVALID)

        config = ConfigModel.objects.filter(is_delete=False, id=config_id).first()
        if not config:
            return APIResponse(code=SystemErrorCode.HTTP_404_NOT_FOUND)

        if config.name == ConfigModel.CONFIG_POINT_TO_CASH_RATIO:
            return APIResponse(code=UserErrorCode.CONFIG_IS_FEATURE_ENABLED)

        data = serializer.validated_data
        value = data.get('value') # type: ignore
        if config.value_type == config.VALUE_TYPE_INT and not str(value).isdigit():
            return APIResponse(code=UserErrorCode.CONFIG_INVALID_INT_TYPE)

        config.value = value
        config.save()
        ConfigModel.clear_cache(name=config.name)
        return APIResponse()

    @classmethod
    def delete(cls, config_id):
        """
        update config.
        """
        config = ConfigModel.objects.filter(is_delete=False, id=config_id).first()
        if not config:
            return APIResponse(code=SystemErrorCode.HTTP_404_NOT_FOUND)

        # config.is_delete = True
        # config.save()
        # ConfigModel.clear_cache(name=config.name)

        # return APIResponse()
        return APIResponse(code=UserErrorCode.CONFIG_IS_FEATURE_ENABLED)


class InviteLogService(BaseService):
    """
    invite log service
    """

    @classmethod
    def get_list(cls, page, offset, order, user_id):
        """
        get invite users.
        """
        base = InviteLogModel.objects.filter(
            Q(inviter_user_id = user_id) | Q(super_inviter_user_id = user_id),
            is_delete=False,
        )

        total = base.count()
        order_fields = cls.check_order_fields(
            InviteLogModel, [item.strip() for item in order.split(',') if item and item.strip()]
        )
        objs = base.order_by(*order_fields)[(page - 1) * offset: page * offset].all()
        user_ids = set()
        for item in objs:
            user_ids.add(item.user_id)
            user_ids.add(item.inviter_user_id)
        user_dict = {}
        if user_ids:
            user_dict = {
                item.id: item for item in AccountModel.objects.filter(id__in=list(user_ids))
            }

        serializer = InviteLogSerializer(objs, many=True, context={
            'user_dict': user_dict
        })

        first_level_total = InviteLogModel.objects.only("id").filter(inviter_user_id = user_id).count()
        second_level_total = InviteLogModel.objects.only("id").filter(super_inviter_user_id = user_id).count()

        return APIResponse(
            result=serializer.data, count=total, direct_invite_count=first_level_total,
            indirect_invite_count=second_level_total
        )


class ReportService(BaseService):
    """
    report service.
    """

    @classmethod
    def get_summary(cls) -> APIResponse:
        """
        get today summary.
        """
        user_total = AccountModel.objects.filter(is_delete=False).count()
        chat_total = ChatRecordModel.objects.filter(is_delete=False, success=True).count()

        order_dict = OrderModel.objects.filter(
            status=OrderModel.STATUS_SUCCESS, is_delete=False
        ).aggregate(total=Count("*"), total_price=Sum("actual_price"))

        return APIResponse(result={
            "register_user": user_total or 0,
            "usage_total": chat_total or 0,
            "recharge_count": order_dict.get('total') or 0,
            "recharge_amount": order_dict.get('total_price') or 0,
        })

    @classmethod
    def get_summary_by_day(cls, start_date=None, end_date=None) -> APIResponse:
        """
        get summary by day.
        """
        if not end_date:
            end_date = date.today()

        end_date += timedelta(days=1)

        if not start_date:
            start_date = end_date - timedelta(days=30)

        user_objs = AccountModel.objects.filter(
            is_delete=False, add_time__gte=start_date, add_time__lte=end_date
        ).values('add_time__date').annotate(total=Count('*'))
        user_dict = {
            item['add_time__date']: item['total'] for item in user_objs
        }
        chat_objs = ChatRecordModel.objects.filter(
            is_delete=False, success=True, add_time__gte=start_date, add_time__lte=end_date
        ).values('add_time__date').annotate(total=Count('*'))
        chat_dict = {
            item['add_time__date']: item['total'] for item in chat_objs
        }
        order_objs = OrderModel.objects.filter(
            status=OrderModel.STATUS_SUCCESS,
            is_delete=False, add_time__gte=start_date, add_time__lte=end_date
        ).values('add_time__date').annotate(total=Count("*"), total_price=Sum("actual_price"))
        order_dict = {
            item['add_time__date']: item for item in order_objs
        }
        result = []
        while start_date < end_date:
            result.append({
                'date': start_date,
                "register_user": user_dict.get(start_date) or 0,
                "usage_total": chat_dict.get(start_date) or 0,
                "recharge_count": order_dict.get(start_date, {}).get('total') or 0,
                "recharge_amount": order_dict.get(start_date, {}).get('actual_price') or 0,
            })
            start_date += timedelta(days=1)

        return APIResponse(result=result)

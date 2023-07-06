"""
api service.
"""
from datetime import datetime, timedelta, time, date
import json
from math import floor
from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import Coalesce
from django.utils.translation import gettext_lazy as _

from asset.models import O2OPaymentLogModel, O2OPaymentModel, PointsLogModel, PointsModel, PointsWithdrawModel
from asset.serializer import CreateWithdrawSerializer, ExchangePointsSerializer, PointsLogSerializer, WithdrawSerializer
from base.exception import AssetErrorCode, SystemErrorCode
from base.response import APIResponse, SerializerErrorResponse
from base.service import BaseService
from order import wechat

from order.models import OrderModel, OrderPackageModel
from users.models import AccountModel, ConfigModel, InviteLogModel


class O2OPaymentService(BaseService):
    """
    o2opayment service.
    """

    @classmethod
    @transaction.atomic
    def add_payment_by_order(cls, order: OrderModel):
        """
        add payment by order.
        """
        package = OrderPackageModel.objects.get(pk=order.package_id)
        with transaction.atomic():
            payment = cls.init_payment(order.user_id)

            usage_total = order.quantity * package.usage_count
            usage_expire_time = None
            if package.category == OrderPackageModel.CATEGORY_TRANSIENT:
                usage_expire_time = (
                    max(payment.transient_expire_time, datetime.now()) + timedelta(days=package.usage_days)
                )

            note = ""
            if usage_expire_time is None:
                payment.persistence_usage_count += usage_total
                note = _("User has purchased a persistence package")
            else:
                payment.transient_usage_count += usage_total
                payment.transient_expire_time = usage_expire_time
                note = _("User has purchased a transient package")

            payment.save()
            O2OPaymentLogModel.objects.create(
                user_id=order.user_id,
                payment_id=payment.id,
                category=O2OPaymentLogModel.CATEGORY_BUY,
                expire_time=usage_expire_time,
                usage_count=usage_total,
                note=note,
                order_id=order.id
            )
        
        return True

    @classmethod
    def init_payment(cls, user_id):
        """
        init payment.
        """
        payment = O2OPaymentModel.objects.filter(user_id=user_id).first()
        if not payment:
            payment = O2OPaymentModel(
                user_id=user_id,
                transient_expire_time=datetime.combine(date.today() + timedelta(days=1), time.min),
                transient_usage_count=0,
                persistence_usage_count=0,
                free_expire_time=datetime.combine(date.today() + timedelta(days=1), time.min),
                free_usage_count=0
            )
            payment.save()

        return payment

    @classmethod
    @transaction.atomic
    def add_free_payment(cls, user_id):
        """
        add free payment.
        """
        with transaction.atomic():
            payment = cls.init_payment(user_id)
            old_free_usage_count = payment.free_usage_count

            payment.free_expire_time = datetime.combine(date.today() + timedelta(days=1), time(0, 0, 0))
            payment.free_usage_count = ConfigModel.get_int(
                ConfigModel.CONFIG_FREE_TRIAL_COUNT, 10, _("Number of free experiences, number type, must be greater than 0")
            )
            payment.save()
            note = _("Get free experience")

            if old_free_usage_count > 0:
                O2OPaymentLogModel.objects.create(
                    user_id=user_id,
                    payment_id=payment.id,
                    category=O2OPaymentLogModel.CATEGORY_EXPIRED,
                    expire_time=payment.free_expire_time,
                    usage_count=payment.free_usage_count,
                    note=_('Free emptying times per day')
                )

            O2OPaymentLogModel.objects.create(
                user_id=user_id,
                payment_id=payment.id,
                category=O2OPaymentLogModel.CATEGORY_FREE,
                expire_time=payment.free_expire_time,
                usage_count=payment.free_usage_count,
                note=note
            )

            return payment

    @classmethod
    @transaction.atomic
    def add_payment_by_points(cls, user_id, point):
        """
        add payment by point.
        """
        with transaction.atomic():
            usage_total = floor(point * ConfigModel.get_int(
                ConfigModel.CONFIG_POINT_TO_CHAT_COUNT_RATIO, 1, _("Set the proportion of points redemption times")
            ))
            payment = cls.init_payment(user_id)

            payment.persistence_usage_count += usage_total
            payment.save()
            note = _("Users use points to exchange")
            O2OPaymentLogModel.objects.create(
                user_id=user_id,
                payment_id=payment.id,
                category=O2OPaymentLogModel.CATEGORY_EXCHANGE,
                usage_count=usage_total,
                note=note
            )

        return True

    @classmethod
    @transaction.atomic
    def add_payment_by_reward(cls, user_id, count, note):
        """
        add payment by reward.
        """
        with transaction.atomic():
            payment = cls.init_payment(user_id)

            payment.persistence_usage_count += count
            payment.save()

            O2OPaymentLogModel.objects.create(
                user_id=user_id,
                payment_id=payment.id,
                category=O2OPaymentLogModel.CATEGORY_REWARD,
                expire_time=None,
                usage_count=count,
                note=note,
                order_id=None
            )

        return True

    @classmethod
    @transaction.atomic
    def reduce_payment(cls, user_id, count):
        """
        reduce payment.
        """
        with transaction.atomic():
            payment = cls.init_payment(user_id)

            payment = O2OPaymentModel.objects.select_for_update().get(pk=payment.id)

            total_count = payment.free_usage_count + payment.transient_usage_count + payment.persistence_usage_count
            if total_count < count:
                return False

            if payment.free_usage_count > 0:
                sub_count = 0
                if count <= payment.free_usage_count:
                    sub_count = count
                    payment.free_usage_count -= count
                    count = 0
                else:
                    sub_count = payment.free_usage_count
                    payment.free_usage_count = 0
                    count = count - sub_count
                O2OPaymentLogModel.objects.create(
                    user_id=user_id,
                    payment_id=payment.id,
                    category=O2OPaymentLogModel.CATEGORY_CONSUME,
                    expire_time=None,
                    usage_count=sub_count,
                    note=_('Used free number of times')
                )
            if count > 0 and payment.transient_usage_count > 0:
                sub_count = 0
                if count <= payment.transient_usage_count:
                    sub_count = count
                    payment.transient_usage_count -= count
                    count = 0
                else:
                    sub_count = payment.transient_usage_count
                    payment.transient_usage_count = 0
                    count = count - sub_count
                O2OPaymentLogModel.objects.create(
                    user_id=user_id,
                    payment_id=payment.id,
                    category=O2OPaymentLogModel.CATEGORY_CONSUME,
                    expire_time=None,
                    usage_count=sub_count,
                    note=_('Used transient number of times')
                )
            if count > 0 and payment.persistence_usage_count > 0:
                sub_count = 0
                if count <= payment.persistence_usage_count:
                    sub_count = count
                    payment.persistence_usage_count -= count
                    count = 0
                else:
                    sub_count = payment.persistence_usage_count
                    payment.persistence_usage_count = 0
                    count = count - sub_count

                O2OPaymentLogModel.objects.create(
                    user_id=user_id,
                    payment_id=payment.id,
                    category=O2OPaymentLogModel.CATEGORY_CONSUME,
                    expire_time=None,
                    usage_count=sub_count,
                    note=_('Used persistence number of times')
                )

            payment.save()

            if count > 0:
                raise Exception(_("consume payment error"))

            return True


class PointsService(BaseService):
    """
    points service.
    """

    @classmethod
    @transaction.atomic
    def add_invite_point_by_order(cls, order: OrderModel):
        """
        Add points to the inviter users
        """
        invite_obj = InviteLogModel.objects.filter(
            user_id=order.user_id
        ).first()

        if not invite_obj:
            return True

        level1_ratio = ConfigModel.get_int(
            ConfigModel.CONFIG_LEVEL1_COMMISSION_RATIO, 4000,
            _("The proportion of first level commission. Range is between (0-10000)"),
        )
        level2_ratio = ConfigModel.get_int(
            ConfigModel.CONFIG_LEVEL2_COMMISSION_RATIO, 800,
            _("The proportion of second level commission. Range is between (0-10000)"),
        )
        cash_ratio = ConfigModel.get_int(
            ConfigModel.CONFIG_POINT_TO_CASH_RATIO, 10,
            _("Set the redemption ratio of points withdrawal.")
        )
        with transaction.atomic():
            total_point = float(order.actual_price) * cash_ratio
            parent_point = floor(total_point * (level1_ratio / 10000))
            super_parent_point = floor(total_point * (level2_ratio / 10000))
            if invite_obj.inviter_user_id:
                PointsModel.add_point(
                    invite_obj.inviter_user_id, parent_point, _('The direct invitee has been recharged'),
                    source=PointsLogModel.SOURCE_DIRECT_INVITE
                )

            if invite_obj.super_inviter_user_id:
                PointsModel.add_point(
                    invite_obj.super_inviter_user_id, super_parent_point, _('Indirect invitee has been recharged'),
                    source=PointsLogModel.SOURCE_INDIRECT_INVITE
                )

        return True

    @classmethod
    @transaction.atomic
    def reduce_point(cls, user_id, amount, description, source=None):
        """
        reduce point.
        """
        with transaction.atomic():
            obj = PointsModel.objects.filter(user_id=user_id, is_delete=False).first()
            if not obj:
                return APIResponse(code=SystemErrorCode.HTTP_404_NOT_FOUND)

            if obj.total < amount:
                return APIResponse(code=AssetErrorCode.POINT_NOT_ENOUGH)

            obj.total -= amount
            obj.save()

            PointsLogModel.objects.create(
                user_id=user_id,
                point_id=obj.id,
                category=PointsLogModel.CATEGORY_SUB,
                amount=amount,
                source=source,
                note=description
            )

    @classmethod
    @transaction.atomic
    def exchange_point(cls, user_id, request):
        """
        Exchange points for assets
        """
        serializer = ExchangePointsSerializer(data=request.data)
        if not serializer.is_valid():
            return SerializerErrorResponse(serializer, code=SystemErrorCode.PARAMS_INVALID)

        data = serializer.validated_data
        point = data.get('point', 0) # type: ignore

        obj = PointsModel.objects.filter(user_id=user_id, is_delete=False).first()
        if not obj:
            return APIResponse(code=SystemErrorCode.HTTP_404_NOT_FOUND)

        withdraw = PointsWithdrawModel.objects.filter(
            user_id=user_id,
            is_delete=False,
            status__in=[PointsWithdrawModel.STATUS_PENDING, PointsWithdrawModel.STATUS_REFUNDING]
        ).aggregate(total=Sum('point'))

        if obj.total - withdraw.get('total', 0) < point:
            return APIResponse(code=AssetErrorCode.POINT_NOT_ENOUGH)

        with transaction.atomic():
            O2OPaymentService.add_payment_by_points(user_id, point)
            obj.total -= point
            obj.save()

            PointsService.reduce_point(
                obj.user_id, point, _("The number of points exchanged for chat"),
                source=PointsLogModel.SOURCE_EXCHANGE
            )

        return APIResponse()

    @classmethod
    def withdraw_point(cls, user_id, request):
        """
        Withdraw points for crash
        """
        serializer = CreateWithdrawSerializer(data=request.data)
        if not serializer.is_valid():
            return SerializerErrorResponse(serializer, code=SystemErrorCode.PARAMS_INVALID)

        data = serializer.validated_data
        point = data.get('point', 0) # type: ignore
        realname = data.get('realname') # type: ignore
        contact = data.get('contact') # type: ignore
        openid = data.get('openid')  # type: ignore

        obj = PointsModel.objects.filter(user_id=user_id, is_delete=False).first()
        if not obj:
            return APIResponse(code=SystemErrorCode.HTTP_404_NOT_FOUND)

        exists = PointsWithdrawModel.objects.filter(
            user_id=user_id,
            is_delete=False,
            status=PointsWithdrawModel.STATUS_PENDING
        ).count() > 0

        if exists:
            return APIResponse(AssetErrorCode.WITHDRAW_IS_IN_PROGRESS)

        withdraw = PointsWithdrawModel.objects.filter(
            user_id=user_id,
            is_delete=False,
            status__in=[PointsWithdrawModel.STATUS_PENDING, PointsWithdrawModel.STATUS_REFUNDING]
        ).aggregate(total=Coalesce(Sum('point'), 0))

        if obj.total - withdraw.get('total', 0) < point:
            return APIResponse(code=AssetErrorCode.POINT_NOT_ENOUGH)

        ratio = ConfigModel.get_int(ConfigModel.CONFIG_POINT_TO_CASH_RATIO)
        if point < ratio:
            error = AssetErrorCode.ERRORS_DICT.get(AssetErrorCode.POINT_LESS_THAN_MIN_VALUE, '')
            return APIResponse(code=AssetErrorCode.POINT_LESS_THAN_MIN_VALUE, msg=_(error) % {"count": ratio})

        PointsWithdrawModel.objects.create(
            user_id=user_id,
            realname=realname,
            contact=contact,
            point=point,
            amount=point / ratio,
            ratio=ratio,
            openid=openid
        )

        return APIResponse()


class PointsWithdrawService(BaseService):
    """
    points withdraw service.
    """

    @classmethod
    def get_list(cls, user_id, page, offset, order, status) -> APIResponse:
        """
        get points withdraw list.
        """
        base = PointsWithdrawModel.objects.filter(is_delete=False)
        if user_id is not None:
            base = base.filter(user_id=user_id)

        if status is not None:
            base = base.filter(status=status)

        total = base.count()
        order_fields = cls.check_order_fields(
            OrderPackageModel, [item.strip() for item in order.split(',') if item and item.strip()]
        )
        objs = base.order_by(*order_fields)[(page - 1) * offset: page * offset].all()

        serializer = WithdrawSerializer(objs, many=True)

        return APIResponse(result=serializer.data, count=total)

    @classmethod
    @transaction.atomic
    def audit(cls, withdraw_id, request) -> APIResponse:
        """
        audit withdraw api.
        """
        with transaction.atomic():
            obj = PointsWithdrawModel.objects.select_for_update().filter(
                status__in=[PointsWithdrawModel.STATUS_PENDING, PointsWithdrawModel.STATUS_FAILURE],
                id=withdraw_id
            ).first()
            if not obj:
                return APIResponse(code=SystemErrorCode.HTTP_404_NOT_FOUND)

            data = request.data
            success = data.get('success')
            if success:
                obj.status = PointsWithdrawModel.STATUS_REFUNDING
            else:
                obj.status = PointsWithdrawModel.STATUS_REJECT
            obj.audit_time = datetime.now()
            obj.audit_user_id = request.user.id
            obj.save()
            if obj.status == PointsWithdrawModel.STATUS_REFUNDING:
                if not obj.openid:
                    return APIResponse()

                # TODO 这里需要修改：obj.amount
                # success, data = wechat.transfer(obj.openid, 0.5)
                # obj.transfer_note = json.dumps(data, ensure_ascii=False)
                success = True
                if success:
                    PointsService.reduce_point(
                        obj.user_id, obj.point, _("Cash withdrawal examination and approval, deducting points"),
                        source=PointsLogModel.SOURCE_WITHDRAW
                    )
                    obj.status = PointsWithdrawModel.STATUS_SUCCESS
                    obj.save()
                    return APIResponse(result=data)

                obj.status = PointsWithdrawModel.STATUS_FAILURE
                obj.save()
                return APIResponse(code=AssetErrorCode.WITHDRAW_FAILURE, msg=data.get('message'))

        return APIResponse()


class PointsLogService(BaseService):
    """
    points log service.
    """

    @classmethod
    def get_list(cls, user_id, page, offset, order) -> APIResponse:
        """
        get points withdraw list.
        """
        base = PointsLogModel.objects.filter(is_delete=False)
        if user_id is not None:
            base = base.filter(user_id=user_id)

        total = base.count()
        order_fields = cls.check_order_fields(
            PointsLogModel, [item.strip() for item in order.split(',') if item and item.strip()]
        )
        objs = base.order_by(*order_fields)[(page - 1) * offset: page * offset].all()

        user_dict = {}
        user_ids = set()
        for item in objs:
            user_ids.add(item.user_id)

        if user_ids:
            user_dict = {
                item.id: item for item in AccountModel.objects.filter(id__in=list(user_ids))
            }
        serializer = PointsLogSerializer(objs, many=True, context={
            'user_dict': user_dict
        })

        return APIResponse(result=serializer.data, count=total)

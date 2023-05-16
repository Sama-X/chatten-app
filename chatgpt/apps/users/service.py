"""
api service.
"""
from datetime import datetime, timedelta
import json
from django.conf import settings
from django.core.cache import cache
from django.db import transaction
from django.db.models import Sum, F
from django.db.models.functions import Coalesce
from django_redis import get_redis_connection
from base.common import CommonUtil
from base.exception import UserErrorCode
from base.response import APIResponse

from base.sama import SamaClient
from users.models import AccountModel, InviteLogModel, ScoreLogModel, ScoreModel, WalletModel


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
            obj = ScoreModel.objects.filter(user_id=user_id).first()
            if not obj:
                obj = ScoreModel(user_id=user_id, balance=0)

            obj.balance += amount
            obj.save()

            wallet_obj = WalletModel.objects.filter(
                user_id=user_id, chain=chain
            ).first()

            if not wallet_obj:
                wallet = SamaClient.create_wallet()
                if wallet.result:
                    wallet_obj = WalletModel(
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

            ScoreLogModel.objects.create(
                user_id=user_id, score_id=obj.id,
                category=ScoreLogModel.CATEGORY_ADD,
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


class UserServiceHelper:
    """
    user service helper.
    """

    EXPERIENCE_REWARD_KEY = "chat:experience:reward:{}:times"
    EXPERIENCE_USED_KEY = "chat:experience:used:{}:times"

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

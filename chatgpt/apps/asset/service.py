"""
api service.
"""
from datetime import datetime, timedelta, time, date
from math import floor
from django.db import transaction
from asset.models import O2OPaymentLogModel, O2OPaymentModel, PointsModel
from base.service import BaseService

from order.models import OrderModel, OrderPackageModel
from users.models import ConfigModel, InviteLogModel


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
            payment = O2OPaymentModel.objects.filter(user_id=order.user_id).first()
            if not payment:
                payment = O2OPaymentModel(
                    user_id=order.user_id,
                    transient_expire_time=datetime.now(),
                    transient_usage_count=0,
                    persistence_usage_count=0,
                    free_expire_time=datetime.now().date() + timedelta(days=1),
                    free_usage_count=ConfigModel.get_int(ConfigModel.CONFIG_FREE_TRIAL_COUNT)
                )
            usage_total = order.quantity * package.usage_count
            usage_expire_time = None
            if package.category == OrderPackageModel.CATEGORY_TRANSIENT:
                usage_expire_time = (
                    max(payment.transient_expire_time, datetime.now()) + timedelta(days=package.usage_days)
                )

            note = ""
            if usage_expire_time is None:
                payment.persistence_usage_count += usage_total
                note = f"User has purchased a persistence package. total: {usage_total}"
            else:
                payment.transient_usage_count += usage_total
                payment.transient_expire_time = usage_expire_time
                note = f"User has purchased a transient package. total: {usage_total} expired_at: {usage_expire_time}"

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
    @transaction.atomic
    def add_free_payment(cls, user_id):
        """
        add free payment.
        """
        with transaction.atomic():
            payment = O2OPaymentModel.objects.filter(user_id=user_id).first()
            if not payment:
                payment = O2OPaymentModel(
                    user_id=user_id,
                    transient_expire_time=datetime.now(),
                    transient_usage_count=0,
                    persistence_usage_count=0
                )

            today = date.today()
            zero = time(0, 0, 0)
            payment.free_expire_time = datetime.combine(today + timedelta(days=1), zero)
            payment.free_usage_count=ConfigModel.get_int(ConfigModel.CONFIG_FREE_TRIAL_COUNT)
            payment.save()
            note = (
                f"User has purchased a transient package. total: {payment.free_usage_count} "
                f"expired_at: {payment.free_expire_time}"
            )
            O2OPaymentLogModel.objects.create(
                user_id=user_id,
                payment_id=payment.id,
                category=O2OPaymentLogModel.CATEGORY_FREE,
                expire_time=payment.free_expire_time,
                usage_count=payment.free_usage_count,
                note=note
            )

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

        with transaction.atomic():
            total_point = order.actual_price * ConfigModel.get_int(ConfigModel.CONFIG_POINT_TO_CASH_RATIO)
            parent_point = floor(total_point * (ConfigModel.get_int(ConfigModel.CONFIG_LEVEL1_COMMISSION_RATIO) / 10000))
            super_parent_point = floor(total_point * (ConfigModel.get_int(ConfigModel.CONFIG_LEVEL2_COMMISSION_RATIO) / 10000))
            if invite_obj.inviter_user_id:
                PointsModel.add_point(
                    invite_obj.inviter_user_id, parent_point, f'The direct invitee has been recharged, get points: {parent_point}'
                )
            if invite_obj.super_inviter_user_id:
                PointsModel.add_point(
                    invite_obj.inviter_user_id, super_parent_point, f'Indirect invitee has been recharged, get points: {super_parent_point}'
                )

        return True

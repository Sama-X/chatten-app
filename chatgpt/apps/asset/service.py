"""
api service.
"""
from datetime import datetime, timedelta, time, date
from math import floor
from django.db import transaction
from django.db.models import Sum
from asset.models import O2OPaymentLogModel, O2OPaymentModel, PointsModel, PointsWithdrawModel
from asset.serializer import CreateWithdrawSerializer, WithdrawSerializer
from base.exception import AssetErrorCode, SystemErrorCode
from base.response import APIResponse, SerializerErrorResponse
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
                    free_expire_time=datetime.combine(date.today() + timedelta(days=1), time(0, 0, 0)),
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

    @classmethod
    @transaction.atomic
    def add_payment_by_points(cls, user_id, point):
        """
        add payment by point.
        """
        with transaction.atomic():
            usage_total = floor(point * ConfigModel.get_int(ConfigModel.CONFIG_POINT_TO_CHAT_COUNT_RATIO))
            payment = O2OPaymentModel.objects.filter(user_id=user_id).first()
            if not payment:
                payment = O2OPaymentModel(
                    user_id=user_id,
                    transient_expire_time=datetime.now(),
                    transient_usage_count=0,
                    persistence_usage_count=0,
                    free_expire_time=datetime.combine(date.today() + timedelta(days=1), time(0, 0, 0)),
                    free_usage_count=ConfigModel.get_int(ConfigModel.CONFIG_FREE_TRIAL_COUNT)
                )

            payment.persistence_usage_count += usage_total
            payment.save()
            note = f"Users use points to exchange. total: {usage_total} "
            O2OPaymentLogModel.objects.create(
                user_id=user_id,
                payment_id=payment.id,
                category=O2OPaymentLogModel.CATEGORY_EXCHANGE,
                usage_count=usage_total,
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

    @classmethod
    def exchange_point(cls, user_id, request):
        """
        Exchange points for assets
        """
        serializer = CreateWithdrawSerializer(data=request.data)
        if not serializer.is_valid():
            return SerializerErrorResponse(serializer, code=SystemErrorCode.PARAMS_INVALID)

        data = serializer.validated_data
        point = data.get('point', 0) # type: ignore
        realname = data.get('realname') # type: ignore
        contact = data.get('contact') # type: ignore

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

        ratio = ConfigModel.get_int(ConfigModel.CONFIG_POINT_TO_CASH_RATIO)
        PointsWithdrawModel.objects.create(
            user_id=user_id,
            realname=realname,
            contact=contact,
            point=point,
            amount=point / ratio,
            ratio=ratio
        )

        return APIResponse()


class PointsWithdrawService(BaseService):
    """
    points withdraw service.
    """

    @classmethod
    @classmethod
    def get_list(cls, user_id, page, offset, order, status) -> APIResponse:
        """
        get points withdraw list.
        """
        base = PointsWithdrawModel.objects.filter(
            is_delete=False, user_id=user_id
        )
        if status is not None:
            base = base.filter(status=status)

        total = base.count()
        order_fields = cls.check_order_fields(
            OrderPackageModel, [item.strip() for item in order.split(',') if item and item.strip()]
        )
        objs = base.order_by(*order_fields)[(page - 1) * offset: page * offset].all()

        serializer = WithdrawSerializer(objs, many=True)

        return APIResponse(result=serializer.data, count=total)

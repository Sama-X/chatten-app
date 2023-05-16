"""
api service.
"""
from django.conf import settings
from django.db import transaction
from django_redis import get_redis_connection
from base.common import CommonUtil
from base.exception import OrderErrorCode, SystemErrorCode, UserErrorCode
from base.response import APIResponse, SerializerErrorResponse
from base.sama import SamaClient

from order.admin.serializer import CreateOrderPackageSerializer, OrderPackageSerializer, UpdateOrderPackageSerializer
from order.models import OrderPackageModel

from users.models import AccountModel, ScoreLogModel, ScoreModel, WalletModel


class OrderPackageService:
    """
    order package service.
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
        get order package list.
        """
        base = OrderPackageModel.objects.filter(is_delete=False)
        total = base.count()
        order_fields = cls.check_order_fields(
            OrderPackageModel, [item.strip() for item in order.split(',') if item and item.strip()]
        )
        objs = base.order_by(*order_fields)[(page - 1) * offset: page * offset].all()

        serializer = OrderPackageSerializer(objs, many=True)

        return APIResponse(result=serializer.data, count=total)

    @classmethod
    @transaction.atomic
    def create_package(cls, request) -> APIResponse | SerializerErrorResponse:
        """
        create order package.
        """
        serializer = CreateOrderPackageSerializer(data=request.data)
        if not serializer.is_valid():
            return SerializerErrorResponse(serializer, code=SystemErrorCode.PARAMS_INVALID)

        data = serializer.validated_data
        name = data.get('name') # type: ignore
        category = data.get('category') # type: ignore
        usage_days = data.get('usage_days', 0) # type: ignore
        usage_count = data.get('usage_count', 0) # type: ignore
        price = data.get('price', 0) # type: ignore
        priority = data.get('priority') # type: ignore

        if category == OrderPackageModel.CATEGORY_TRANSIENT:
            if usage_days <= 0:
                return APIResponse(code=OrderErrorCode.ORDER_PACKAGE_TRANSIENT_NO_DAYS)
        elif category == OrderPackageModel.CATEGORY_PERSISTENCE:
            usage_days = 0
        else:
            return APIResponse(code=OrderErrorCode.ORDER_PACKAGE_INVALID_CATEGORY)

        exists = OrderPackageModel.objects.filter(is_delete=False, name=name).count() > 0
        if exists:
            return APIResponse(code=OrderErrorCode.ORDER_PACKAGE_NAME_EXISTS)

        if not priority:
            last_package = OrderPackageModel.objects.only("id").last()
            if last_package:
                priority = last_package.id + 1
            else:
                priority = 1

        with transaction.atomic():
            OrderPackageModel.objects.create(
                name=name,
                category=category,
                usage_days=usage_days,
                usage_count=usage_count,
                price=price,
                priority=priority
            )
            return APIResponse()

    @classmethod
    def get_detail(cls, package_id):
        """
        get order package detail.
        """
        obj = OrderPackageModel.objects.filter(is_delete=False, id=package_id).first()
        if not obj:
            return APIResponse(code=SystemErrorCode.HTTP_404_NOT_FOUND)

        serializer = OrderPackageSerializer(obj)

        return APIResponse(result=serializer.data)

    @classmethod
    @transaction.atomic
    def update(cls, package_id, request):
        """
        update order package detail.
        """
        obj = OrderPackageModel.objects.filter(is_delete=False, id=package_id).first()
        if not obj:
            return APIResponse(code=SystemErrorCode.HTTP_404_NOT_FOUND)

        serializer = UpdateOrderPackageSerializer(data=request.data)
        if not serializer.is_valid():
            return SerializerErrorResponse(serializer, code=SystemErrorCode.PARAMS_INVALID)

        data = serializer.validated_data
        name = data.get('name') # type: ignore
        category = data.get('category') # type: ignore
        usage_days = data.get('usage_days', 0) # type: ignore
        usage_count = data.get('usage_count', 0) # type: ignore
        price = data.get('price', 0) # type: ignore
        priority = data.get('priority') # type: ignore

        if category == OrderPackageModel.CATEGORY_TRANSIENT:
            if usage_days <= 0:
                return APIResponse(code=OrderErrorCode.ORDER_PACKAGE_TRANSIENT_NO_DAYS)
        elif category == OrderPackageModel.CATEGORY_PERSISTENCE:
            usage_days = 0
        else:
            return APIResponse(code=OrderErrorCode.ORDER_PACKAGE_INVALID_CATEGORY)

        if not priority:
            priority = obj.priority

        with transaction.atomic():
            obj.is_delete = True
            exists = OrderPackageModel.objects.filter(is_delete=False, name=name).count() > 0
            if exists:
                return APIResponse(code=OrderErrorCode.ORDER_PACKAGE_NAME_EXISTS)

            obj.save()
            OrderPackageModel.objects.create(
                name=name,
                category=category,
                usage_days=usage_days,
                usage_count=usage_count,
                price=price,
                priority=priority
            )
            return APIResponse()

    @classmethod
    def delete(cls, package_id):
        """
        delete order package.
        """
        obj = OrderPackageModel.objects.filter(is_delete=False, id=package_id).first()
        if not obj:
            return APIResponse(code=SystemErrorCode.HTTP_404_NOT_FOUND)
        
        obj.is_delete = True
        obj.save()

        return APIResponse()

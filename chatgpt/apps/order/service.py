"""
api service.
"""
import base64
from django.db import transaction
from django.http import HttpResponse
from asset.service import O2OPaymentService, PointsLogService, PointsService
from base.common import CommonUtil
from base.exception import OrderErrorCode, SystemErrorCode
from base.response import APIResponse, SerializerErrorResponse
from base.service import BaseService

from order import utils, wechat
from order.admin.serializer import CreateOrderPackageSerializer, OrderPackageSerializer, UpdateOrderPackageSerializer
from order.models import OrderModel, OrderPackageModel
from order.serializer import CreateOrderSeriralizer, OrderSerializer
from users.models import AccountModel


class OrderPackageService(BaseService):
    """
    order package service.
    """
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
            obj.save()
            exists = OrderPackageModel.objects.filter(is_delete=False, name=name).count() > 0
            if exists:
                return APIResponse(code=OrderErrorCode.ORDER_PACKAGE_NAME_EXISTS)

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


class OrderService(BaseService):
    """
    order service.
    """
    @classmethod
    def get_list(cls, page, offset, order, user_id=None, package_id=None, out_trade_no=None, status=None) -> APIResponse:
        """
        get order list.
        """
        conditions = {
            'is_delete': False
        }
        if user_id:
            conditions['user_id'] = user_id
        if package_id:
            conditions['package_id'] = package_id
        if out_trade_no:
            conditions['out_trade_no__icontains'] = out_trade_no
        if status is not None:
            conditions['status'] = status

        base = OrderModel.objects.filter(**conditions)
        if user_id:
            base = base.filter()
        total = base.count()
        order_fields = cls.check_order_fields(
            OrderModel, [item.strip() for item in order.split(',') if item and item.strip()]
        )
        objs = base.order_by(*order_fields)[(page - 1) * offset: page * offset].all()

        user_ids, package_ids = set(), set()
        for item in objs:
            user_ids.add(item.user_id)
            package_ids.add(item.package_id)

        user_dict, order_package_dict = {}, {}
        if user_ids:
            user_dict = {
                user.id: user for user in AccountModel.objects.filter(id__in=list(user_ids)).all()
            }
        if package_ids:
            order_package_dict = {
                item.id: item for item in OrderPackageModel.objects.filter(id__in=list(package_ids)).all()
            }

        serializer = OrderSerializer(objs, many=True, context={
            'user_dict': user_dict,
            'order_package_dict': order_package_dict
        })

        return APIResponse(result=serializer.data, count=total)

    @classmethod
    def get_order_detail(self, order_id):
        """
        get order detail.
        """
        order_obj = OrderModel.objects.filter(id=order_id, is_delete=False).first()

        if not order_obj:
            return APIResponse(code=SystemErrorCode.HTTP_404_NOT_FOUND)

        user_ids, package_ids = {order_obj.user_id}, {order_obj.package_id}

        user_dict, order_package_dict = {}, {}
        if user_ids:
            user_dict = {
                user.id: user for user in AccountModel.objects.filter(id__in=list(user_ids)).all()
            }
        if package_ids:
            order_package_dict = {
                item.id: item for item in OrderPackageModel.objects.filter(id__in=list(package_ids)).all()
            }

        serializer = OrderSerializer(order_obj, context={
            'user_dict': user_dict,
            'order_package_dict': order_package_dict
        })

        return APIResponse(result=serializer.data)

    @classmethod
    @transaction.atomic
    def create_order(cls, request):
        """
        create order
        """
        serializer = CreateOrderSeriralizer(data=request.data)
        if not serializer.is_valid():
            return SerializerErrorResponse(serializer, code=SystemErrorCode.PARAMS_INVALID)

        data = serializer.validated_data
        package_id = data.get('package_id')  # type: ignore
        quantity = data['quantity']  # type: ignore
        payment_method = data.get('payment_method')  # type: ignore
        client = data.get('client')  # type: ignore

        if payment_method not in OrderModel.METHODS_DICT:
            return APIResponse(code=OrderErrorCode.ORDER_INVALID_PAYMENT_METHOD)

        if payment_method == OrderModel.METHOD_WECHAT and client not in OrderModel.CLIENT_DICT:
            return APIResponse(code=OrderErrorCode.ORDER_INVALID_PAYMENT_CLIENT)

        package = OrderPackageModel.objects.filter(
            is_delete=False, id=package_id
        ).first()
        if not package:
            return APIResponse(code=OrderErrorCode.ORDER_PACKAGE_INVALID)

        order_obj = OrderModel.objects.create(
            user_id=request.user.id,
            package_id=package_id,
            out_trade_no=utils.gen_code(),
            quantity=quantity,
            actual_price=quantity * package.price,
            payment_method=payment_method,
            client=client
        )

        if order_obj.payment_method == OrderModel.METHOD_WECHAT:
            if client == OrderModel.CLIENT_NATIVE:
                code_url = wechat.native_prepay(order_obj.actual_price / 1000, order_obj.out_trade_no)

                print('code_url = ', code_url)
                img_stream = utils.make_qrcode(data=code_url)
                return APIResponse(result={
                    'image': f'data:image/png;base64,{base64.b64encode(img_stream).decode("utf8")}',
                    'order_id': order_obj.id
                })
            elif client == OrderModel.CLIENT_H5:
                ip_addr = request.META.get('REMOTE_ADDR')
                try:
                    ip_addr = request.headers['X-Forwarded-For']
                except:
                    pass
                h5_url = wechat.h5_prepay(order_obj.actual_price / 1000, order_obj.out_trade_no, ip=ip_addr)

                print('h5_url = ', h5_url)
                return APIResponse(result={
                    'h5_url': h5_url,
                    'order_id': order_obj.id
                })

        return APIResponse(code=SystemErrorCode.HTTP_400_BAD_REQUEST)

    @classmethod
    @transaction.atomic
    def update_order_by_out_trade_no(cls, out_trade_no, data):
        """
        """
        trade_state = data['trade_state']
        transaction_id = data['transaction_id']
        with transaction.atomic():
            order_obj = OrderModel.objects.filter(
                is_delete=False, out_trade_no=out_trade_no, status=OrderModel.STATUS_PENDING
            ).first()
            if not order_obj:
                return False
            if trade_state == "SUCCESS":
                order_obj.transaction_id = transaction_id
                order_obj.status = OrderModel.STATUS_SUCCESS
                order_obj.save()

                O2OPaymentService.add_payment_by_order(order_obj)
                PointsService.add_invite_point_by_order(order_obj)
                return True
            else:
                order_obj.status = OrderModel.STATUS_FAILURE
                order_obj.save()
        return False

"""
<<<<<<< HEAD
chat api module.
"""

from datetime import datetime
import json
import logging
import traceback

from asgiref.sync import async_to_sync
from django.conf import settings
from django_redis import get_redis_connection

from rest_framework import viewsets, mixins
from rest_framework.decorators import action

from base.ai import AIErrorCode, get_ai_instance
from base.exception import SystemErrorCode
from base.middleware import AnonymousAuthentication
from base.response import APIResponse, SerializerErrorResponse
from base.serializer import BaseQuery
from order.serializer import OrderListSerializer
from order.models import OrderModel
from order.service import OrderService

import wechat
from chatgpt.settings import WECHAT
import utils

logger = logging.getLogger(__name__)


class OrderViewSet(mixins.ListModelMixin, mixins.CreateModelMixin):
    """
    order view.
    """

from rest_framework import mixins, viewsets

from base.middleware import AnonymousAuthentication
from base.serializer import BaseQuery
from order.serializer import OrderQuery
from order.service import OrderPackageService, OrderService


class OrderViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    order api.
    """

    authentication_classes = [AnonymousAuthentication,]

    def list(self, request, *args, **kwargs):
        """
        get order list
        url: /api/v1/orders/
        query = BaseQuery(data=request.GET)
        url: /api/v1/order/orders/
        method: get
        desc: get order list api
        """
        query = OrderQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or 'status,-id'  # type: ignore
        user_id = request.user.id
        package_id = query.validated_data.get('package_id')  # type: ignore
        order_number = query.validated_data.get('order_number')  # type: ignore
        status = query.validated_data.get('status')  # type: ignore

        return OrderService.get_list(page, offset, order, user_id, package_id, order_number, status)

    def create(self, request, *args, **kwargs):
        """
        url: /api/v1/order/orders/
        method: post
        params: {
            package_id: 1,
            quantity: 1,
            payment_method: 0
        }
        desc: create order  api
        """

        return OrderService.create_order(request)


    

class WePayNotifyHandler(mixins.CreateModelMixin):
    def post(self):
        # print("WePayNotifyHandler,header=", self.request.headers)
        # print("WePayNotifyHandler,body=", self.request.body)
        headers = self.request.headers
        certificate = wechat.get_cert()
        print('weewww=', headers['Wechatpay-Signature'])
        serial = headers['Wechatpay-Serial']
        if serial != wechat['MCH_CERT_SERIAL_NO']:
            self.write({'status': 'fail'})

        verify_ok = utils.check_notify_sign(headers['Wechatpay-Timestamp'], headers['Wechatpay-Nonce'], self.request.body.decode('utf-8'), certificate, headers['Wechatpay-Signature'])
        print('verify_ok=', verify_ok)
        if verify_ok:
            data = utils.decryWePayNotify(self.get_json_data())
            print("WePayNotifyHandler,data=", data)
            OrderService.update_order_by_out_trade_no(data['out_trade_no'], {"transaction_id": data['transaction_id']})
            if data['trade_state'] == "SUCCESS":
                OrderService.update_order_by_out_trade_no(data['out_trade_no'], {"transaction_id": data['transaction_id'], "status":'2'})
            else:
                OrderService.update_order_by_out_trade_no(data['out_trade_no'], {"transaction_id": data['transaction_id']})

        return APIResponse()


class OrderPackageViewSet(mixins.ListModelMixin, mixins.CreateModelMixin,
                          mixins.RetrieveModelMixin, mixins.DestroyModelMixin,
                          mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    order package api.
    """
    authentication_classes = (AnonymousAuthentication,)

    def list(self, request, *args, **kwargs):
        """
        url: /api/v1/order/order-packages
        method: get
        desc: get order list
        """
        query = BaseQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or 'priority,id'  # type: ignore

        return OrderPackageService.get_list(page, offset, order)

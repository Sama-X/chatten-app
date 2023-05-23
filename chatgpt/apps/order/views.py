"""
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
    chat topic api.
    """

    authentication_classes = [AnonymousAuthentication,]

    def list(self, request, *args, **kwargs):
        """
        get order list
        url: /api/v1/orders/
        """
        query = BaseQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or '-id'  # type: ignore
        user_id = request.user.id

        order_fields = []
        support_fields = [i.name for i in OrderModel._meta.fields]
        for field in order.split(','):
            if field.replace('-', '') in support_fields:
                order_fields.append(field)
        base = OrderModel.objects.filter(
            user_id=user_id,
            is_delete=False
        )
        total = base.count()
        if order_fields:
            base = base.order_by(*order_fields)

        base = base[(page - 1) * offset: page * offset]

        data = OrderListSerializer(base, many=True).data

        used_experience = OrderModel.objects.filter(
            user_id=request.user.id,
            is_delete=False,
            success=True,
            question_time__gte=datetime.now().date()
        ).count()

        return APIResponse(
            result=data, total=total, used_experience=used_experience,
            experience=request.user.experience, is_vip=request.user.is_vip
        )



    def post(self, request, *args, **kwargs):
        """
        clear chat topic history
        method: delete
        url: /api/v1/chat/topics/
        """
        # create_order(float(amount), out_trade_no)
        user_id = request.user.id
        OrderModel.objects.filter(
            user_id=user_id,
            is_delete=False
        ).update(is_delete=True)

        return APIResponse()
    

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

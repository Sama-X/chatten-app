"""
order api module.
"""
from datetime import datetime

import json
import logging

from django.utils.translation import gettext as _

from rest_framework import mixins, viewsets

from base.ding_sdk import DingBaseClient
from base.middleware import AnonymousAuthentication
from base.response import APIResponse
from base.serializer import BaseQuery

from order import wechat, utils
from order.serializer import OrderQuery
from order.service import OrderPackageService, OrderService
from users.service import UserServiceHelper

logger = logging.getLogger(__name__)


class OrderViewSet(mixins.ListModelMixin, mixins.CreateModelMixin,
                   mixins.RetrieveModelMixin,
                   viewsets.GenericViewSet):
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
        out_trade_no = query.validated_data.get('out_trade_no')  # type: ignore
        status = query.validated_data.get('status')  # type: ignore

        return OrderService.get_list(page, offset, order, user_id, package_id, out_trade_no, status)

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

    def retrieve(self, request, *args, **kwargs):
        """
        url: /api/v1/order/orders/<order_id>/
        method: get
        desc: get order detail api
        """
        order_id = kwargs["pk"]
        return OrderService.get_order_detail(order_id)


class WePayNotifyHandler(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    wechat pay notify api
    """

    def get_json_data(self):
        """
        get json data
        """
        data = json.loads(self.request.body)
        logger.info("[wechat notify api] json data: %s", data)
        return data

    def create(self, request):
        """
        wechat pay notify handler.
        """
        logger.info("[wechat notify api] WePayNotifyHandler, header=%s", self.request.headers)
        logger.info("[wechat notify api] WePayNotifyHandler, body=%s", self.request.body)

        headers = self.request.headers
        certificate = wechat.get_cert()
        logger.info('[wechat notify api] signature: %s', headers['Wechatpay-Signature'])
        # serial = headers['Wechatpay-Serial']
        # if serial != WECHAT['MCH_CERT_SERIAL_NO']:
        #     return HttpResponse({'status': 'fail'})

        verify_ok = utils.check_notify_sign(
            headers['Wechatpay-Timestamp'], headers['Wechatpay-Nonce'], self.request.body.decode('utf-8'),
            certificate, headers['Wechatpay-Signature']
        )
        logger.info('[wechat notify api] verify_ok = %s', verify_ok)
        if verify_ok:
            data = utils.decryWePayNotify(self.get_json_data())
            logger.info("[wechat notify api] WePayNotifyHandler, data=%s", data)
            success, order_obj = OrderService.update_order_by_out_trade_no(data['out_trade_no'], data)
            if success and order_obj:
                content = _('The user(%(user_id)s) paid %(amount)s yuan at %(now)s.') % {
                    'user_id': order_obj.user_id, 'amount': order_obj.actual_price,
                    'now': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                }
                DingBaseClient.send_bussiness_msg(
                    title=_("wechat pay notify"), content=content
                )
                UserServiceHelper.clear_experience_cache(order_obj.user_id)

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

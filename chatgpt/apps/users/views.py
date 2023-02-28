"""
account api module.
"""

from datetime import datetime
from uuid import uuid4
from django.conf import settings
from django.core.cache import cache

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.throttling import ScopedRateThrottle

from base.common import CommonUtil

from base.exception import UserErrorCode
from base.constants import (
    LOGIN_SMS_CODE_KEY, LOGIN_SMS_CODE_TIME_LENGTH, LOGIN_TOKEN_ACCOUNT_KEY, LOGIN_ACCOUNT_TOKEN_KEY,
    LOGIN_LIFE_TIME_LENGTH
)
from base.response import APIResponse
from users.models import AccountModel, MessageLogModel
from users.serializer import LoginSerializer, SendSmsMessageSerializer


class LoginViewSet(viewsets.GenericViewSet):

    authentication_classes = []
    serializer_class = ()
    queryset = None

    @action(methods=['POST'], detail=False)
    def token(self, request, *args, **kwargs):
        """
        url: /api/v1/users/token
        """
        form = LoginSerializer(data=request.data)
        form.is_valid(raise_exception=True)

        mobile = form.validated_data['mobile']  # type: ignore
        code = form.validated_data['code']  # type: ignore

        sms_code_key = LOGIN_SMS_CODE_KEY.format(mobile)
        new_code = cache.get(sms_code_key)
        if not new_code or code != new_code:
            return APIResponse(code=UserErrorCode.USER_INVALID_CODE)

        account = AccountModel.objects.filter(mobile=mobile).first()
        if not account:
            account = AccountModel.objects.create(
                mobile=mobile
            )
        ip_addr = request.META.get('REMOTE_ADDR')
        try:
            ip_addr = request.headers['X-Forwarded-For']
        except:
            pass
        account.login_time = datetime.now()
        account.login_ip = ip_addr
        account.save()

        token = uuid4().hex
        cache.set(LOGIN_TOKEN_ACCOUNT_KEY.format(token), account.id, LOGIN_LIFE_TIME_LENGTH)
        cache.set(LOGIN_ACCOUNT_TOKEN_KEY.format(account.id), token, LOGIN_LIFE_TIME_LENGTH)
        cache.delete(sms_code_key)

        return APIResponse(result={
            'id': account.id,
            'nickname': account.nickname,
            'token': token
        })


class SmsMessageViewSet(viewsets.GenericViewSet):
    """
    Send sms message api.
    """
    throttle_scope = settings.THROTTLE_SEND_SMS
    authentication_classes = []

    @action(methods=['POST'], url_path="sms-code", detail=False,
            throttle_classes=[ScopedRateThrottle])
    def sms_code(self, request, *args, **kwargs):
        """
        send sms code api.
        url: /api/v1/users/sms-code
        """
        form = SendSmsMessageSerializer(data=request.data)
        form.is_valid(raise_exception=True)

        mobile = form.validated_data['mobile']  # type: ignore

        code = CommonUtil.generate_sms_code()
        cache.set(LOGIN_SMS_CODE_KEY.format(mobile), code, LOGIN_SMS_CODE_TIME_LENGTH)
        MessageLogModel.objects.create(
            mobile=mobile,
            content=f'Your login verification code: {code}',
            category=MessageLogModel.CATEGORY_NOTIFY,
            response=None,
            success=True,
            request_time=datetime.now(),
            response_time=None
        )
        if settings.DEBUG:
            return APIResponse(result={
                'code': code
            })

        return APIResponse()

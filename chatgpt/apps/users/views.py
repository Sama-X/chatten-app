"""
account api module.
"""

from datetime import datetime
import logging
from uuid import uuid4
from django.conf import settings
from django.core.cache import cache

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.throttling import ScopedRateThrottle

from base.common import CommonUtil

from base.exception import SystemErrorCode, UserErrorCode
from base.constants import (
    LOGIN_SMS_CODE_KEY, LOGIN_SMS_CODE_TIME_LENGTH
)
from base.response import APIResponse, SerializerErrorResponse
from users.models import AccountModel, MessageLogModel
from users.serializer import CreateAccountSerializer, LoginSerializer, SendSmsMessageSerializer
from users.service import UserService

logger = logging.getLogger(__name__)


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
        if not form.is_valid():
            return SerializerErrorResponse(form, SystemErrorCode.HTTP_400_BAD_REQUEST)

        mobile = form.validated_data.get('mobile')  # type: ignore
        code = form.validated_data.get('code')  # type: ignore
        password = form.validated_data.get('password')  # type: ignore

        if not code and not password:
            return APIResponse(code=UserErrorCode.USER_OAUTH_REQUIRED)

        if code:
            return self._handle_code_login(request, mobile, code)

        return self._handle_password_login(request, mobile, password)

    def _handle_code_login(self, request, mobile, code):
        """
        handle code login function.
        """
        sms_code_key = LOGIN_SMS_CODE_KEY.format(mobile)
        new_code = cache.get(sms_code_key)
        if not new_code or code != new_code:
            return APIResponse(code=UserErrorCode.USER_INVALID_CODE)

        account = AccountModel.objects.filter(username=mobile).first()
        if not account:
            account = AccountModel.objects.create(
                username=mobile,
                mobile=mobile
            )
            UserService.add_score(account.id, 10 * settings.SAMA_UNIT, settings.CHAIN_SAMA)

        ip_addr = request.META.get('REMOTE_ADDR')
        try:
            ip_addr = request.headers['X-Forwarded-For']
        except:
            pass
        account.login_time = datetime.now()
        account.login_ip = ip_addr
        account.save()

        token = CommonUtil.generate_user_token(account.id)
        cache.delete(sms_code_key)

        return APIResponse(result={
            'id': account.id,
            'nickname': account.nickname,
            'token': token,
            'experience': account.experience
        })

    def _handle_password_login(self, request, mobile, password):
        """
        handle password login function.
        """
        account = AccountModel.objects.filter(username=mobile).first()
        if not account or not account.check_password(password):
            return APIResponse(code=UserErrorCode.USER_INVALID_PASSWORD)

        ip_addr = request.META.get('REMOTE_ADDR')
        try:
            ip_addr = request.headers['X-Forwarded-For']
        except:
            pass
        account.login_time = datetime.now()
        account.login_ip = ip_addr
        account.save()

        token = CommonUtil.generate_user_token(account.id)

        return APIResponse(result={
            'id': account.id,
            'nickname': account.nickname,
            'token': token,
            'experience': account.experience
        })

    @action(methods=['POST'], detail=False)
    def register(self, request, *args, **kwargs):
        """
        account register api
        url: /api/v1/users/register
        """
        form = CreateAccountSerializer(data=request.data)
        if not form.is_valid():
            return SerializerErrorResponse(form, SystemErrorCode.HTTP_400_BAD_REQUEST)

        username = form.validated_data['username']  # type: ignore
        password = form.validated_data['password']  # type: ignore

        exists = AccountModel.objects.filter(
            username=username
        ).count() > 0
        if exists:
            return APIResponse(code=UserErrorCode.USER_EXISTS)

        account = AccountModel(
            username=username,
            user_type=AccountModel.USER_TYPE_NORMAL
        )
        account.password = password
        account.save()

        UserService.add_score(account.id, 10 * settings.SAMA_UNIT, settings.CHAIN_SAMA)
        token = CommonUtil.generate_user_token(account.id)

        return APIResponse(result={
            'id': account.id,
            'nickname': account.nickname,
            'token': token,
            'experience': account.experience
        })

    @action(methods=['POST'], detail=False)
    def anonymous(self, request, *args, **kwargs):
        """
        create anonymous account
        url: /api/v1/users/anonymous
        """
        username = uuid4().hex
        exists = AccountModel.objects.filter(
            username=username
        ).count() > 0
        if exists:
            return APIResponse(code=UserErrorCode.USER_EXISTS)

        account = AccountModel(
            username=username
        )
        account.password = 'Aa12345678'
        account.user_type = AccountModel.USER_TYPE_ANONY
        account.save()
        UserService.add_score(account.id, 10 * settings.SAMA_UNIT, settings.CHAIN_SAMA)
        token = CommonUtil.generate_user_token(account.id)

        return APIResponse(result={
            'id': account.id,
            'nickname': account.nickname,
            'token': token,
            'experience': account.experience
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
        if not form.is_valid():
            return SerializerErrorResponse(form, SystemErrorCode.HTTP_400_BAD_REQUEST)

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

"""
account api module.
"""

from datetime import datetime
import json
import logging
from django.conf import settings
from django.core.cache import cache
from django_redis import get_redis_connection

from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.throttling import ScopedRateThrottle

from base.common import CommonUtil, RequestClient

from base.exception import SystemErrorCode, UserErrorCode
from base.constants import (
    LOGIN_SMS_CODE_KEY, LOGIN_SMS_CODE_TIME_LENGTH
)
from base.middleware import AnonymousAuthentication
from base.response import APIResponse, SerializerErrorResponse
from base.serializer import BaseQuery
from users.models import AccountModel, MessageLogModel
from users.serializer import CreateAccountSerializer, LoginSerializer, SendSmsMessageSerializer
from users.service import InviteLogService, UserService

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
            conn = get_redis_connection()
            conn.lpush(UserService.SAMA_TASKS_KEY, json.dumps([account.id, 10, None]))

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

        return APIResponse(result=CommonUtil.generate_login_result(token, account))

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
        invite_code = form.validated_data.get('invite_code') # type: ignore

        return UserService.register(username, password, invite_code, user_type=AccountModel.USER_TYPE_NORMAL)


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


class UserProfileViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    user profile api.
    """
    authentication_classes = [AnonymousAuthentication,]

    def list(self, request, *args, **kwargs):
        """
        get user profile.
        url: /api/v1/users/profile
        method: get
        """
        user = request.user

        UserService.check_given_gift_experience(user.id)

        result = {
            'id': user.id,
            'nickname': user.nickname,
            'experience': UserService.get_user_experience(user.id),
            'reward_experience': 0,
            'used_experience': 0,
            'points': UserService.get_user_points(user.id),
            'invite_code': None,
            'openid': user.openid
        }
        if request.user.user_type == AccountModel.USER_TYPE_NORMAL:
            result['invite_code'] = CommonUtil.encode_hashids(user.id)

        return APIResponse(result=result)

    def update(self, request, *args, **kwargs):
        """
        get user profile.
        url: /api/v1/users/profile
        data: {
            "openid": "",
            "nickname": ""
        }
        method: put
        """
        return UserService.update_wechat_info(request)


class InviteLogViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    invite log api
    """

    authentication_classes = [AnonymousAuthentication,]

    def list(self, request, *args, **kwargs):
        """
        url: /api/v1/users/invite-logs/
        method: get
        desc: get invite logs api
        """
        query = BaseQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or '-id'  # type: ignore
        user_id = request.user.id

        return InviteLogService.get_list(page, offset, order, user_id)


class WechatLoginViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    wechat login.
    """

    authentication_classes = [AnonymousAuthentication,]

    def create(self, request, *args, **kwargs):
        """
        wechat login api.
        """
        appid = settings.WECHAT["APP_ID"]
        secret = settings.WECHAT["APP_SECRET"]
        code = request.data.get('code')
        if not code:
            return APIResponse(code=SystemErrorCode.HTTP_400_BAD_REQUEST)

        url = (
            f"https://api.weixin.qq.com/sns/oauth2/access_token?"
            f"appid={appid}&secret={secret}&code={code}&grant_type=authorization_code"
        )
        resp = RequestClient.get(url)
        return APIResponse(result=resp)

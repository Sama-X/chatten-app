"""
account api module.
"""

from uuid import uuid4
from django.core.cache import cache

from rest_framework import viewsets
from rest_framework.decorators import action

from base.exception import SystemErrorCode
from base.constants import (
    LOGIN_TOKEN_KEY, LOGIN_ACCOUNT_KEY, LOGIN_LIFE_TIME_LENGTH
)
from base.response import APIResponse
from users.models import AccountModel
from users.serializer import LoginSerializer


class LoginViewSet(viewsets.GenericViewSet):

    SMS_CODE_KEY = 'mobile:login:{}:code'

    @action(methods=['POST'])
    def token(self, request, *args, **kwargs):
        """
        url: /api/v1/login
        """
        form = LoginSerializer(data=request.json)
        form.is_valid(raise_exception=True)

        mobile = form.validated_data['mobile']  # type: ignore
        code = form.validated_data['code']  # type: ignore

        new_code = cache.get(self.SMS_CODE_KEY.format(mobile))
        if not new_code or code != new_code:
            return APIResponse(code=SystemErrorCode.HTTP_400_BAD_REQUEST)

        account = AccountModel.objects.filter(mobile=mobile).first()
        if not account:
            account = AccountModel.objects.create(
                mobile=mobile
            )
            account.save

        token = uuid4().hex
        cache.set(LOGIN_TOKEN_KEY.format(token), account.id, LOGIN_LIFE_TIME_LENGTH)
        cache.set(LOGIN_ACCOUNT_KEY.format(account.id), token, LOGIN_LIFE_TIME_LENGTH)

        return APIResponse(result={
            'id': account.id,
            'nickname': account.nickname,
            'token': token
        })

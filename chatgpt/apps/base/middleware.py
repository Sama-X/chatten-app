"""
middleware modules.
"""
import traceback
from django.conf import settings
from django.core.cache import cache
from django.utils.translation import gettext as _

from rest_framework import authentication
from rest_framework.exceptions import (
    AuthenticationFailed, NotAuthenticated, ValidationError
)

from base.constants import LOGIN_TOKEN_ACCOUNT_KEY
from base.exception import SystemErrorCode
from base.response import APIResponse
from users.models import AccountModel


class AnonymousAuthentication(authentication.BaseAuthentication):
    """
    Anonymous and token authentication.
    """
    def authenticate(self, request):
        """
        authenticate
        """
        token = request.headers.get('Authorization')
        if not token:
            msg = _('auth: user need login')
            raise AuthenticationFailed(msg)

        account_id = cache.get(LOGIN_TOKEN_ACCOUNT_KEY.format(token))
        # multiple login check
        # old_token = cache.get(LOGIN_TOKEN_KEY.format(user_id))
        # if old_token != token:
        #     return None
        user = AccountModel.objects.filter(id=account_id).first()
        if not user:
            msg = _('auth: user need login')
            raise AuthenticationFailed(msg)

        return (user, None)

    def has_permission(self, request):
        """
        has permission
        """
        return True


def exception_catch(exception, ctx):
    """
    global exception catch.
    """
    if exception.__class__ in (AuthenticationFailed, NotAuthenticated):
        return APIResponse(code=SystemErrorCode.HTTP_401_UNAUTHORIZED)

    if exception.__class__ in (ValidationError,):
        errors = [";".join([str(val) for val in values]) for values in exception.detail.values()]
        errors = ';'.join(errors)
        return APIResponse(code=SystemErrorCode.HTTP_400_BAD_REQUEST, msg=errors)

    print(traceback.format_exc())
    if hasattr(exception, '__module__') and exception.__module__ == 'rest_framework.exceptions':
        return APIResponse(code=exception.status_code, msg=exception.detail)

    return APIResponse(SystemErrorCode.HTTP_500_INTERNAL_SERVER_ERROR)

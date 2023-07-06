"""
middleware modules.
"""
import logging
import sys
import traceback
from django.conf import settings
from django.contrib.auth.models import User
from django.core.cache import cache
from django.utils.translation import gettext_lazy as _

from rest_framework import authentication
from rest_framework.exceptions import (
    AuthenticationFailed, NotAuthenticated, ValidationError
)

from base.constants import ADMIN_LOGIN_TOKEN_ACCOUNT_KEY, LOGIN_TOKEN_ACCOUNT_KEY
from base.ding_sdk import DingBaseClient
from base.exception import SystemErrorCode
from base.response import APIResponse
from users.models import AccountModel

logger = logging.getLogger(__name__)


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


class AdminAuthentication(authentication.BaseAuthentication):
    """
    Admin and token authentication.
    """
    def authenticate(self, request):
        """
        authenticate
        """
        token = request.headers.get('Authorization')
        if not token:
            msg = _('auth: user need login')
            raise AuthenticationFailed(msg)

        account_id = cache.get(ADMIN_LOGIN_TOKEN_ACCOUNT_KEY.format(token))
        user = User.objects.filter(id=account_id).first()
        if not user:
            msg = _('auth: user need login')
            raise AuthenticationFailed(msg)

        return (user, None)

    def has_permission(self, request):
        """
        has permission
        """
        return True

def get_current_error_markdown(request):
    """
    get error info with markdown.
    """
    e_type, e_value, _ = sys.exc_info()
    uri = None
    if hasattr(request, 'get_raw_uri'):
        uri = request.get_raw_uri()
    elif hasattr(request, 'stream'):
        uri = request.stream.get_full_path_info()
    note = f'''
## api
    {uri}

### env
    {"test" if settings.DEBUG else "production"}

### error summay
    **type**: {e_type}
    **detail**: {str(e_value)}

### params
    **query**: {dict(request.query_params)}
    **body**: {dict(request.data)}

### location
    {traceback.format_exc()}
'''
    return note

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

    error_msg = traceback.format_exc()
    logger.error("System error: %s", error_msg)
    if hasattr(exception, '__module__') and exception.__module__ == 'rest_framework.exceptions':
        return APIResponse(code=exception.status_code, msg=exception.detail)

    if not settings.DEBUG:
        uri = None
        request = ctx['request']
        if hasattr(request, 'get_raw_uri'):
            uri = request.get_raw_uri()
        elif hasattr(request, 'stream'):
            uri = request.stream.get_full_path_info()

        title = f'[{settings.CURRENT_ENV}] system error. uri: {uri}'
        error = get_current_error_markdown(request)
        DingBaseClient.send_sys_error(title, error)

    return APIResponse(SystemErrorCode.HTTP_500_INTERNAL_SERVER_ERROR)

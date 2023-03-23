"""
exception module.
"""

from django.utils.translation import gettext as _


class SystemErrorCode:
    """
    system error code
    """
    SUCCESS = 0
    HTTP_400_BAD_REQUEST = 400
    HTTP_500_INTERNAL_SERVER_ERROR = 500
    HTTP_401_UNAUTHORIZED = 401
    HTTP_403_FORBIDDEN = 403
    HTTP_404_NOT_FOUND = 404
    HTTP_405_METHOD_NOT_ALLOWED = 405
    HTTP_406_NOT_ACCEPTABLE = 406
    HTTP_415_UNSUPPORTED_MEDIA_TYPE = 415
    HTTP_429_TOO_MANY_REQUESTS = 429

    PARAMS_INVALID = HTTP_400_BAD_REQUEST

    ERRORS = (
        (SUCCESS, _('success')),
        (HTTP_400_BAD_REQUEST, _('bad request')),
        (HTTP_500_INTERNAL_SERVER_ERROR, _('internal server error')),
        (HTTP_401_UNAUTHORIZED, _('unauthorized')),
        (HTTP_403_FORBIDDEN, _('forbidden')),
        (HTTP_404_NOT_FOUND, _('not found')),
        (HTTP_405_METHOD_NOT_ALLOWED, _('method not allowed')),
        (HTTP_406_NOT_ACCEPTABLE, _('not acceptable')),
        (HTTP_415_UNSUPPORTED_MEDIA_TYPE, _('unsupport media type')),
        (HTTP_429_TOO_MANY_REQUESTS, _('too many requests')),
    )

    ERRORS_DICT = dict(ERRORS)


class UserErrorCode:
    """
    user error code
    """
    USER_INVALID_CODE = 100100
    USER_OAUTH_REQUIRED = 100101
    USER_INVALID_PASSWORD = 100102
    USER_EXISTS = 100103

    ERRORS = (
        (USER_INVALID_CODE, _('invalid code')),
        (USER_EXISTS, _('user exists')),
        (USER_INVALID_PASSWORD, _('wrong user name or password')),
        (USER_OAUTH_REQUIRED, _('code or password required')),
    )

    ERRORS_DICT = dict(ERRORS)


class ChatErrorCode:
    """
    chat error code
    """
    CHAT_ROBOT_NO_RESP = 200100
    CHATGPT_KEY_INVALID = 200200
    CHATGPT_KEY_UNSUPPORT_ANONY_USER = 200201
    CHATGPT_KEY_EXISTS = 200202

    ERRORS = (
        (CHAT_ROBOT_NO_RESP, _('chat robot no resp')),
        (CHATGPT_KEY_INVALID, _('chatgpt key invalid')),
        (CHATGPT_KEY_UNSUPPORT_ANONY_USER, _('chatgpt key unsupport anony user')),
        (CHATGPT_KEY_EXISTS, _('chatgpt key already exists'))
    )

    ERRORS_DICT = dict(ERRORS)

ALL_ERROR_DICT = {}
ALL_ERROR_DICT.update(SystemErrorCode.ERRORS_DICT)
ALL_ERROR_DICT.update(UserErrorCode.ERRORS_DICT)
ALL_ERROR_DICT.update(ChatErrorCode.ERRORS_DICT)

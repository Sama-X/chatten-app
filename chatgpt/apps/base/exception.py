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
    USER_INVALID_MOBILE = 100103
    CONFIG_INVALID_INT_TYPE = 100200
    CONFIG_IS_FEATURE_ENABLED = 100201

    ERRORS = (
        (USER_INVALID_CODE, _('invalid code')),
        (USER_EXISTS, _('user exists')),
        (USER_INVALID_PASSWORD, _('wrong user name or password')),
        (USER_OAUTH_REQUIRED, _('code or password required')),
        (CONFIG_INVALID_INT_TYPE, _('Invalid numeric type')),
        (CONFIG_IS_FEATURE_ENABLED, _('This item is not enabled')),
        (USER_INVALID_MOBILE, _('Invalid mobile phone number'))
    )

    ERRORS_DICT = dict(ERRORS)


class ChatErrorCode:
    """
    chat error code
    """
    CHAT_ROBOT_NO_RESP = 200100
    CHAT_ROBOT_NO_EXPERIENCES = 200101
    CHAT_ROBOT_CONTEXT_LENGTH_EXCEEDED = 200102
    CHATGPT_KEY_INVALID = 200200
    CHATGPT_KEY_UNSUPPORT_ANONY_USER = 200201
    CHATGPT_KEY_EXISTS = 200202

    ERRORS = (
        (CHAT_ROBOT_NO_EXPERIENCES, _('no more experiences')),
        (CHAT_ROBOT_NO_RESP, _('chat robot no resp')),
        (CHAT_ROBOT_CONTEXT_LENGTH_EXCEEDED, _('chat robot context length exceeded')),
        (CHATGPT_KEY_INVALID, _('chatgpt key invalid')),
        (CHATGPT_KEY_UNSUPPORT_ANONY_USER, _('chatgpt key unsupport anony user')),
        (CHATGPT_KEY_EXISTS, _('chatgpt key already exists'))
    )

    ERRORS_DICT = dict(ERRORS)


class OrderErrorCode:
    """
    order error code.
    """
    ORDER_PACKAGE_TRANSIENT_NO_DAYS = 30000
    ORDER_PACKAGE_INVALID_CATEGORY = 30001
    ORDER_PACKAGE_NAME_EXISTS = 30002
    ORDER_PACKAGE_INVALID = 30003
    ORDER_INVALID_PAYMENT_METHOD = 300100
    ORDER_INVALID_PAYMENT_CLIENT = 300101
    ORDER_INVALID_JSAPI_OPENID = 300102

    ERRORS = (
        (ORDER_PACKAGE_TRANSIENT_NO_DAYS, _('The timeliness package cannot be used without days')),
        (ORDER_PACKAGE_INVALID_CATEGORY, _('Invalid package category')),
        (ORDER_PACKAGE_NAME_EXISTS, _('Package name already exists')),
        (ORDER_INVALID_PAYMENT_METHOD, _('Invalid method of payment')),
        (ORDER_PACKAGE_INVALID, _('Invalid order package')),
        (ORDER_INVALID_PAYMENT_CLIENT, _('Unsupported payment client')),
        (ORDER_INVALID_JSAPI_OPENID, _('Invalid wechat openid'))
    )
    ERRORS_DICT = dict(ERRORS)


class AssetErrorCode:
    """
    asset error code.
    """
    POINT_NOT_ENOUGH = 40000
    POINT_LESS_THAN_MIN_VALUE = 40001
    WITHDRAW_IS_IN_PROGRESS = 40100

    ERRORS = (
        (POINT_NOT_ENOUGH, _('Points are not enough')),
        (POINT_LESS_THAN_MIN_VALUE, _('The withdrawal point cannot be less than %(count)s')),
        (WITHDRAW_IS_IN_PROGRESS, _('Withdrawal is in progress')),
    )
    ERRORS_DICT = dict(ERRORS)


ALL_ERROR_DICT = {}
ALL_ERROR_DICT.update(SystemErrorCode.ERRORS_DICT)
ALL_ERROR_DICT.update(UserErrorCode.ERRORS_DICT)
ALL_ERROR_DICT.update(ChatErrorCode.ERRORS_DICT)
ALL_ERROR_DICT.update(OrderErrorCode.ERRORS_DICT)
ALL_ERROR_DICT.update(AssetErrorCode.ERRORS_DICT)

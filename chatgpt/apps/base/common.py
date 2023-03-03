"""
Common util module.
"""
import logging
import random
from uuid import uuid4

from django.core.cache import cache

from base.constants import LOGIN_ACCOUNT_TOKEN_KEY, LOGIN_LIFE_TIME_LENGTH, LOGIN_TOKEN_ACCOUNT_KEY

logger = logging.getLogger(__name__)


class CommonUtil:
    """
    common util class.
    """

    @classmethod
    def generate_sms_code(cls, length=6):
        """
        generate sms code.
        """
        return "".join([str(random.randint(0, 9)) for i in range(length)])

    @classmethod
    def generate_user_token(cls, user_id, expired=LOGIN_LIFE_TIME_LENGTH):
        """
        generate token
        """
        token = uuid4().hex
        cache.set(LOGIN_TOKEN_ACCOUNT_KEY.format(token), user_id, LOGIN_LIFE_TIME_LENGTH)
        cache.set(LOGIN_ACCOUNT_TOKEN_KEY.format(user_id), token, LOGIN_LIFE_TIME_LENGTH)

        return token

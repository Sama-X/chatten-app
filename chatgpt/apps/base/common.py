"""
Common util module.
"""
from datetime import datetime
import logging
import random

from hashids import Hashids
from uuid import uuid4

from django.core.cache import cache
import requests

from base.constants import ADMIN_LOGIN_ACCOUNT_TOKEN_KEY, ADMIN_LOGIN_TOKEN_ACCOUNT_KEY, LOGIN_ACCOUNT_TOKEN_KEY, LOGIN_LIFE_TIME_LENGTH, LOGIN_TOKEN_ACCOUNT_KEY
from users.models import AccountModel

logger = logging.getLogger(__name__)


class CommonUtil:
    """
    common util class.
    """

    HASH = Hashids(salt='61dc562deeca4689b12bffccb7456a27', min_length=8)

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

    @classmethod
    def generate_admin_user_token(cls, user_id, expired=LOGIN_LIFE_TIME_LENGTH):
        """
        generate token
        """
        token = uuid4().hex
        cache.set(ADMIN_LOGIN_TOKEN_ACCOUNT_KEY.format(token), user_id, LOGIN_LIFE_TIME_LENGTH)
        cache.set(ADMIN_LOGIN_ACCOUNT_TOKEN_KEY.format(user_id), token, LOGIN_LIFE_TIME_LENGTH)

        return token

    @classmethod
    def generate_login_result(cls, token, user: AccountModel) -> dict:
        """
        generate login user result.
        """
        return {
            'id': user.id,
            'nickname': user.nickname,
            'token': token,
            'experience': user.experience
        }

    @classmethod
    def encode_hashids(cls, value: int) -> str:
        """
        encode hash ids.
        """
        result = cls.HASH.encode(value)
        return result

    @classmethod
    def decode_hashids(cls, value: str) -> int:
        """
        decode hash ids. return 0 if not found.
        """
        result = cls.HASH.decode(value)

        return result[0] if result else 0

    @staticmethod
    def random_number_str():
        """
        generate random number
        """
        datetime_str = datetime.now().strftime('%Y%m%d%H%M%S')
        random_number = random.randint(0, 9999)
        return f'{datetime_str}{random_number:04}'

    @classmethod
    def generate_order_number(cls):
        """
        generate order number.
        """
        return f'{cls.random_number_str()}'



class RequestClient:
    """
    request client.
    """

    @classmethod
    def _request(cls, _method, url, origin_raw=False, **kwargs):
        """
        request
        """
        logger.info('【request client】start url: %s method: %s, params: %s', url, _method, kwargs)
        _method_func = getattr(requests, _method, requests.get)
        try:
            resp = _method_func(url, **kwargs)
            result = {}

            if not origin_raw:
                if resp.status_code in (200, 201, 204):
                    data = {}
                    try:
                        data = resp.json()
                    except:
                        data['msg'] = resp.text

                    if 'code' not in data:
                        data['code'] = resp.status_code

                    result = data
                else:
                    result = {
                        'code': resp.status_code,
                        'msg': resp.text
                    }

        except Exception as error:
            result = {
                'code': 400,
                'msg': error
            }
            raise error

        logger.info('【request client】end url: %s method: %s result: %s', url, _method, result)
        if result:
            return result

        return resp

    @classmethod
    def get(cls, url, **kwargs):
        """
        GET method.
        """
        return cls._request('get', url, **kwargs)

    @classmethod
    def post(cls, url, **kwargs):
        """
        post method.
        """
        return cls._request('post', url, **kwargs)

    @classmethod
    def put(cls, url, **kwargs):
        """
        put method.
        """
        return cls._request('put', url, **kwargs)

    @classmethod
    def delete(cls, url, **kwargs):
        """
        delete method.
        """
        return cls._request('delete', url, **kwargs)

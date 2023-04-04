"""
Common util module.
"""
import logging
import random
from uuid import uuid4

from django.core.cache import cache
import requests

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

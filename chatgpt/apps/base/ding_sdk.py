"""
dingtalk sdk.
"""

import logging
import time
import hmac
import hashlib
import base64
import requests
import urllib.parse

from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


class DingBaseClient:
    """
    client
    """

    DINGTALK_ROBOT_SEND_MSG_URL = 'https://oapi.dingtalk.com/robot/send'

    @staticmethod
    def _robot_sign(secret):
        """
        sign
        """
        timestamp = str(round(time.time() * 1000))
        secret_enc = secret.encode('utf-8')
        string_to_sign = '{}\n{}'.format(timestamp, secret)
        string_to_sign_enc = string_to_sign.encode('utf-8')
        hmac_code = hmac.new(secret_enc, string_to_sign_enc, digestmod=hashlib.sha256).digest()
        sign = urllib.parse.quote_plus(base64.b64encode(hmac_code))

        return timestamp, sign

    @classmethod
    def _send_robot_msg(cls, title, content, metion_mobiles=None, metion_user_ids=None, is_at_all=False, token=None, secret=None):
        """
        send msg.
        """
        timestamp, sign = cls._robot_sign(secret)

        params = {
            'access_token': token,
            'timestamp': timestamp,
            'sign': sign
        }
        query_str = '&'.join([f'{key}={val}' for key, val in params.items()])
        url = f"{cls.DINGTALK_ROBOT_SEND_MSG_URL}?{query_str}"

        metion_mobiles = metion_mobiles or []
        metion_user_ids = metion_user_ids or []

        payload = {
            "at": {
                "atMobiles": metion_mobiles,
                "atUserIds": metion_user_ids,
                "isAtAll": is_at_all
            },
            "markdown": {
                "title": title,
                "text": content
            },
            "msgtype": "markdown"
        }

        resp = requests.post(url, json=payload)

        logging.info('[dingtalk send message] success result: %s', resp.json())
        return resp

    @classmethod
    def send_sys_error(cls, title, content, metion_mobiles=None, metion_user_ids=None, is_at_all=False):
        """
        send error message.
        """
        return cls._send_robot_msg(
            title, content, metion_mobiles, metion_user_ids, is_at_all, secret=settings.DINGTALK_BUSINESS_ROOM_SECRET,
            token=settings.DINGTALK_BUSINESS_ROOM_TOKEN
        )
        
    @classmethod
    def send_bussiness_msg(cls, title, content, metion_mobiles=None, metion_user_ids=None, is_at_all=False):
        """
        send bussiness message.
        """
        if settings.CURRENT_ENV == 'development':
            return logger.info('debug not send dingtalk')

        return cls._send_robot_msg(
            title, content, metion_mobiles, metion_user_ids, is_at_all, secret=settings.DINGTALK_BUSINESS_ROOM_SECRET,
            token=settings.DINGTALK_BUSINESS_ROOM_TOKEN
        )

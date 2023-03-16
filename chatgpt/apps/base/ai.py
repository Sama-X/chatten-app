"""
AI module.
"""
import heapq
import logging
import openai
from django.conf import settings

openai.proxy = settings.CHATGPT_PROXY or None

logger = logging.getLogger(__name__)


class AIHelper:
    """
    AI help class.
    """

    TASK = []
    TASK_INIT = False

    @classmethod
    def send_msg(cls, question: str, msg_type: str ='text', histories=None):
        """
        send message.
        """
        histories = histories or []
        histories.append({
            "role": "user",
            "content": question
        })
        key = cls.get_api_key()
        logger.info("【chatgpt send】 payload: %s api key: %s", histories, key[:6])
        resp = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=histories)
        result = resp.to_dict_recursive()  # type: ignore
        logger.info("【chatgpt send】 resp: %s", result)
        return result

    @classmethod
    def get_api_key(cls):
        """
        get openai api key
        """
        if not cls.TASK_INIT and len(cls.TASK) <= 0:
            cls.TASK_INIT = True
            for key in settings.CHATGPT_KEYS:
                heapq.heappush(cls.TASK, (0, key))

        priority, key = heapq.heappop(cls.TASK)
        cls.update_api_key(priority + 1, key)
        return key

    @classmethod
    def update_api_key(cls, priority, key):
        """
        update api key priority
        """
        heapq.heappush(cls.TASK, (priority, key))

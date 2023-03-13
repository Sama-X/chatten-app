"""
AI module.
"""
import logging
import openai
from django.conf import settings

openai.api_key = settings.CHATGPT_KEY
openai.proxy = settings.CHATGPT_PROXY or None

logger = logging.getLogger(__name__)


class AIHelper:
    """
    AI help class.
    """

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
        logger.info("【chatgpt send】 payload: %s", histories)
        resp = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=histories)
        result = resp.to_dict_recursive()  # type: ignore
        logger.info("【chatgpt send】 resp: %s", result)
        return result

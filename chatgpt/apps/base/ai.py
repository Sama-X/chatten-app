"""
AI module.
"""
import heapq
import logging
import time
import openai
from openai.error import RateLimitError, APIConnectionError, Timeout, AuthenticationError
from django.conf import settings

openai.proxy = settings.CHATGPT_PROXY or None

logger = logging.getLogger(__name__)


class AIHelper:
    """
    AI help class.
    """

    TASK = []
    TASK_INIT = False
    DROP_KEYS = []

    @classmethod
    async def send_msg(cls, question: str, msg_type: str ='text', histories=None, retry_count=0, key=None):
        """
        send message.
        """
        histories = histories or []
        if retry_count <= 0:
            histories.append({
                "role": "user",
                "content": question
            })
        key = key or cls.get_api_key()
        logger.info("【chatgpt send】 payload: %s api key: %s", histories, key[:6] if key else None)
        result = {}
        try:
            resp = await openai.ChatCompletion.acreate(model="gpt-3.5-turbo", messages=histories, api_key=key, timeout=30)
            result = resp.to_dict_recursive()  # type: ignore
        except RateLimitError as err:
            # rate limit exception
            logger.error("【chatgpt send】reason: rate limit desc: %v", err)
            if retry_count < 1:
                time.sleep(5)
                logger.error("【chatgpt send】RateLimit exceed, repeat retry {} times".format(retry_count+1))
                return cls.send_msg(question, msg_type=msg_type, histories=histories, retry_count=retry_count+1, key=key)
            result["error"] = "rate limit error"
        except APIConnectionError as err:
            logger.error("【chatgpt send】APIConnection failed, reason: %s", err)
            result["error"] = "api connection failed"
        except Timeout as err:
            logger.error("【chatgpt send】Timeout, reason: %s", err)
            result["error"] = "timeout"
        except Exception as err:
            logger.error("【chatgpt send】Exception, reason: %s", err)
            result["error"] = f"exception {err}"
        logger.info("【chatgpt send】 resp: %s", result)
        return result

    @classmethod
    def check_api_key(cls, key) -> bool:
        """
        check api key is valid.
        """
        try:
            resp = openai.Model.list(api_key=key)
            if resp and resp.__sizeof__() > 0:
                return True
        except AuthenticationError as err:
            logger.info("【chatgpt check key】error: %s", err)
            return False
        except Exception as err:
            logger.info("【chatgpt check key】error: %s", err)
            return False
        return True

    @classmethod
    def get_api_key(cls):
        """
        get openai api key
        """
        if not cls.TASK_INIT and len(cls.TASK) <= 0:
            cls.TASK_INIT = True
            for key in settings.CHATGPT_KEYS:
                heapq.heappush(cls.TASK, (0, key))

        priority, key = 0, None
        while len(cls.TASK) > 0 and key is None:
            priority, key = heapq.heappop(cls.TASK)
            if key in cls.DROP_KEYS:
                key = None
                continue
            break

        cls.update_api_key(priority + 1, key)
        return key

    @classmethod
    def update_api_key(cls, priority, key):
        """
        update api key priority
        """
        heapq.heappush(cls.TASK, (priority, key))

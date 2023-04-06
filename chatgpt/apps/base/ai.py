"""
AI module.
"""
from datetime import datetime
import json
import tiktoken
import logging
import time
from base.ai_strategy import PriorityStrategy

import openai
from openai.error import RateLimitError, APIConnectionError, Timeout, AuthenticationError
from django.conf import settings
from django_eventstream import send_event

openai.proxy = settings.CHATGPT_PROXY or None

logger = logging.getLogger(__name__)


class AIHelper:
    """
    AI help class.
    """

    strategy = None

    @classmethod
    async def send_msg(cls, question: str, msg_type: str ='text', histories=None, retry_count=0, key=None, auth_token=None):
        """
        send message.
        """
        if cls.strategy is None:
            cls.strategy = PriorityStrategy()

        histories = histories or []
        if retry_count <= 0:
            histories.append({
                "role": "user",
                "content": question
            })
        key = key or cls.strategy.get_api_key()
        logger.info("【chatgpt send】 payload: %s api key: %s", histories, key[:6] if key else None)
        result = {}
        if not key:
            result['error'] = 'The system is busy, please try again later'
        start = time.time()
        try:
            encoding = tiktoken.encoding_for_model('gpt-3.5-turbo')
            prompt_tokens = len(encoding.encode(json.dumps(histories)))
            resp = openai.ChatCompletion.create(
                model="gpt-3.5-turbo", messages=histories, api_key=key, timeout=30,
                request_timeout=(10, 60), stream=True
            )
            report = []
            index = 0
            for item in resp:
                if item.choices: # type: ignore
                    cont = item.choices[0].delta.get('content', '')  # type: ignore
                    if cont:
                        report.append(cont)
                        send_event(auth_token, 'message', {
                            'id': item.id, # type: ignore
                            'text': cont, 'index': index, 'channel': auth_token,
                            'now': datetime.now()
                        })
                        index += 1
                        logger.info('【chatgpt send】reponse %s: %ss result: %s', index, time.time() - start, cont)

            content = ''.join(report)
            completion_tokens = len(encoding.encode(content))
            result = {
                "id": item.id, # type: ignore
                "object": item.model, # type: ignore
                "created": item.created, # type: ignore
                "model": item.model, # type: ignore
                "usage": {
                    "prompt_tokens": prompt_tokens,
                    "completion_tokens": completion_tokens,
                    "total_tokens": prompt_tokens + completion_tokens
                },
                "choices": [{
                    "message": {
                        "role": "assistant",
                        "content": content
                    },
                    "finish_reason": "stop",
                    "index": 0
                }],
                "key_id": 1
            }
        except RateLimitError as err:
            # rate limit exception
            logger.error("【chatgpt send】reason: rate limit desc: %s", err)
            if retry_count < 1:
                time.sleep(5)
                logger.error("【chatgpt send】RateLimit exceed, repeat retry %s times".format(retry_count+1))
                return cls.send_msg(
                    question, msg_type=msg_type, histories=histories, retry_count=retry_count+1, key=key,
                    auth_token=auth_token
                )
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

        result['key_id'] = cls.strategy.get_api_key_id(key)
        logger.info("【chatgpt send】 resp: %s total cost: %s", result, time.time() - start)
        cls.strategy.release_key(key)
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

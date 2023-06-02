"""
AI module.
"""
from datetime import datetime
import json
import multiprocessing
import os
import threading
from typing import Dict, Optional, Type
import tiktoken
import logging
import time
from base.ai_strategy import BaseStrategy, PriorityStrategy

import openai
from openai.error import RateLimitError, APIConnectionError, Timeout, AuthenticationError
from django.conf import settings
from django_eventstream import send_event

from base.ding_sdk import DingBaseClient

openai.proxy = settings.CHATGPT_PROXY or None

logger = logging.getLogger(__name__)


instance = None

def get_ai_instance():
    """
    get singtance
    """
    global instance
    if instance is None:
        helper = AIHelper()
        singleton = multiprocessing.Manager().Value(AIHelper, helper)
        instance = singleton.value

    logger.info(
        "[chat instance] current process: %s thread: %s instance: %s",
        os.getpid(), threading.currentThread(), id(instance)
    )
    return instance


class AIErrorCode:
    """
    ai error code consts.
    """
    CONTEXT_LENGTH_EXCEEDED = 'context_length_exceeded'


class AIHelper:
    """
    AI help class.
    """
    strategy: BaseStrategy

    def __init__(self) -> None:
        """
        init.
        """
        self.set_strategy()

    def set_strategy(self, strategry_cls: Optional[Type[BaseStrategy]] = None):
        """
        set strategry.
        """
        if not strategry_cls:
            self.strategy = PriorityStrategy()
        else:
            self.strategy = strategry_cls()

    async def send_msg(self, question: str, msg_type: str ='text', histories=None, retry_count=0, key=None, auth_token=None) -> Dict:
        """
        send message.
        """
        if self.strategy is None:
            self.set_strategy()

        histories = histories or []
        if retry_count <= 0:
            histories.append({
                "role": "user",
                "content": question
            })
        key = key or self.strategy.get_api_key()
        logger.info("【chatgpt send】 payload: %s api key: %s", histories, key[:6] if key else None)
        result = {}
        if not key:
            result['error'] = 'The system is busy, please try again later'
            DingBaseClient.send_sys_error(
                title="No key error.",
                content="There is no chatten key."
            )
            result["error"] = f"no chatten key"
            return result

        start = time.time()
        try:
            encoding = tiktoken.encoding_for_model('gpt-3.5-turbo')
            prompt_tokens = len(encoding.encode(json.dumps(histories)))
            resp = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo", messages=histories, api_key=key, request_timeout=(10, 120), stream=True
            )
            report = []
            index = 0
            async for item in resp:  # type: ignore
                if item.choices: # type: ignore
                    cont = item.choices[0].delta.get('content', '')  # type: ignore
                    if cont:
                        report.append(cont)
                        send_event(auth_token, 'message', {
                            'id': item.id, # type: ignore
                            'text': cont, 'index': index, 'channel': auth_token,
                            'now': datetime.now(), 'status': 1
                        })
                        index += 1
                        logger.info('【chatgpt send】reponse %s: %ss result: %s', index, time.time() - start, cont)

            send_event(auth_token, 'message', {
                'status': -1
            })

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
            err_msg = err.user_message
            if err_msg == 'You exceeded your current quota, please check your plan and billing details.':
                self.strategy.drop_key(key)
                DingBaseClient.send_sys_error(
                    title="chatgpt key error",
                    content=f"chatgpt key error\n\nkey: {key}\n\n reason: {err_msg}"
                )
                return await self.send_msg(
                    question, msg_type=msg_type, histories=histories, retry_count=retry_count+1,
                    auth_token=auth_token
                )
            if retry_count < 1:
                time.sleep(5)
                logger.error("【chatgpt send】RateLimit exceed, repeat retry %s times".format(retry_count+1))
                return await self.send_msg(
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
        except openai.InvalidRequestError as err:
            logger.error("【chatgpt send】InvalidRequestError, reason: %s", err)
            result["error"] = err._message
            result["error_code"] = err.code
        except Exception as err:
            logger.error("【chatgpt send】Exception, reason: %s", err)
            result["error"] = f"exception {err}"

        result['key_id'] = self.strategy.get_api_key_id(key)
        logger.info("【chatgpt send】 resp: %s total cost: %s", result, time.time() - start)
        self.strategy.release_key(key)
        return result

    def sync_send_msg(self, question: str, msg_type: str ='text', histories=None, retry_count=0,
                      key=None, auth_token=None, temperature=1.0):
        """
        sync send message.
        """
        print("sync send message.....")
        if self.strategy is None:
            self.set_strategy()

        histories = histories or []
        if retry_count <= 0:
            histories.append({
                "role": "user",
                "content": question
            })
        key = key or self.strategy.get_api_key()
        logger.info("【chatgpt sync send】 payload: %s api key: %s", histories, key[:6] if key else None)
        result = {}
        if not key:
            result['error'] = 'The system is busy, please try again later'
        start = time.time()
        try:
            resp = openai.ChatCompletion.create(
                model="gpt-3.5-turbo", messages=histories, api_key=key, request_timeout=(10, 120),
                temperature=temperature
            )
            result = resp.to_dict_recursive()  # type: ignore
        except RateLimitError as err:
            # rate limit exception
            logger.error("【chatgpt send】reason: rate limit desc: %s", err)
            if retry_count < 1:
                time.sleep(5)
                logger.error("【chatgpt send】RateLimit exceed, repeat retry %s times".format(retry_count+1))
                return self.sync_send_msg(
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
        except openai.InvalidRequestError as err:
            logger.error("【chatgpt send】InvalidRequestError, reason: %s", err)
            result["error"] = err._message
            result["error_code"] = err.code
        except Exception as err:
            logger.error("【chatgpt send】Exception, reason: %s", err)
            result["error"] = f"exception {err}"

        result['key_id'] = self.strategy.get_api_key_id(key)
        logger.info("【chatgpt send】 resp: %s total cost: %s", result, time.time() - start)
        self.strategy.release_key(key)
        return result

    def check_api_key(self, key) -> bool:
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

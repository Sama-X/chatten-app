"""
AI module.
"""
import openai
from django.conf import settings

openai.api_key = settings.CHATGPT_KEY


class AIHelper:
    """
    AI help class.
    """

    @classmethod
    def send_msg(cls, question: str, msg_type: str ='text'):
        """
        send message.
        """
        resp = openai.Completion.create(model="text-davinci-003", prompt=question, temperature=0.7,  max_tokens=2048)
        return resp.to_dict_recursive() # type: ignore

"""
chat model module.
"""
from datetime import datetime, timedelta
from django.db import models
from django.utils.translation import gettext as _

from base.models import BaseModel


class ChatRecordModel(BaseModel):
    """
    chat record table.
    """
    MSG_TYPE_TEXT = 1

    MSG_TYPES = (
        (MSG_TYPE_TEXT, _("db:chatrecord: msg type text")),
    )

    MSG_TYPES_DICT = dict(MSG_TYPES)

    user_id = models.BigIntegerField(db_index=True, verbose_name=_("db:chatrecord: user foreign key"))
    msg_type = models.SmallIntegerField(
        default=MSG_TYPE_TEXT, db_index=True, verbose_name=_("db:chatrecord: message type")
    )
    question = models.TextField(null=False, verbose_name=_("db:chatrecord: question"))
    question_time = models.DateTimeField(verbose_name=_("db:chatrecord: question time"))
    answer = models.TextField(null=True, verbose_name="db:chatrecord: answer")
    approval = models.IntegerField(default=0, verbose_name=_("db:chatrecord: approval number"))
    response = models.TextField(null=True, verbose_name=_("db:chatrecord: chatgpt response result"))
    success = models.BooleanField(default=False, verbose_name=_("db:chatrecord: QA success"))
    response_time = models.DateTimeField(null=True, verbose_name=_("db:chatrecord: chatgpt response time"))
    prompt_tokens = models.IntegerField(default=0, verbose_name=_("db.chatrecord: question token usage"))
    resp_tokens = models.IntegerField(default=0, verbose_name=_("db.chatrecord: resp token usage"))
    total_tokens = models.IntegerField(default=0, verbose_name=_("db.chatrecord: total token usage"))
    chatgpt_key_id = models.BigIntegerField(db_index=True, null=True, verbose_name=_("db:chatgpt key foreign key"))
    chat_topic_id = models.BigIntegerField(db_index=True, null=True, verbose_name=_("db:chat topic id"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("db:chatrecord:ChatRecord")
        verbose_name_plural = verbose_name
        db_table = "chat_record"

    @classmethod
    def get_gpt_chat_logs(cls, user_id, topic_id):
        """
        get chat logs
        """
        histories = cls.objects.filter(
            user_id=user_id,
            success=True,
            chat_topic_id=topic_id
        ).order_by('-id').all()

        total_tokens = 0
        messages = []
        for item in histories:
            if not item.answer:
                continue

            messages.append({
                "role": "assistant",
                "content": item.answer.replace('\n', '')
            })
            messages.append({
                "role": "user",
                "content": item.question
            })
            total_tokens += item.resp_tokens

        return messages[::-1]


class ChatgptKeyModel(BaseModel):
    """
    chatgpt key table.
    """
    user_id = models.BigIntegerField(db_index=True, verbose_name=_("db:user foreign key"))
    key = models.CharField(max_length=128, unique=True, null=False, verbose_name=_("db:chatgpt key"))
    enable = models.BooleanField(default=True, verbose_name=_("db:enable"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("db:chatgpt table")
        verbose_name_plural = verbose_name
        db_table = "chatgpt_key"


class ChatTopicModel(BaseModel):
    """
    chat topic model.
    """

    title = models.CharField(max_length=128, verbose_name=_("db:chat topic"))
    user_id = models.BigIntegerField(db_index=True, verbose_name=_("db:user foreign key"))

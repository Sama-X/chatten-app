"""
chat model module.
"""
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

    class Meta:
        """
        Meta
        """
        verbose_name = _("db:chatrecord:ChatRecord")
        verbose_name_plural = verbose_name
        db_table = "chat_record"

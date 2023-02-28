"""
User model module.
"""
from django.db import models
from django.utils.translation import gettext as _
from base.models import BaseModel


class AccountModel(BaseModel):
    """
    Account table.
    """
    mobile = models.CharField(max_length=16, unique=True, null=False, verbose_name=_("db:account:user mobile"))
    password = models.CharField(max_length=512, null=True, verbose_name=_("db:account:user password"))
    nickname = models.CharField(max_length=32, null=True, verbose_name=_("db:account:user nickname"))
    avatar = models.CharField(max_length=128, null=True, verbose_name=_("db:account:user avatar"))
    experience = models.SmallIntegerField(default=10, verbose_name=_("db:account:user experience time"))
    is_vip = models.BooleanField(default=False, verbose_name=_("db:account:user is vip"))
    login_time = models.DateTimeField(null=True, verbose_name=_("db:account:user last login time"))
    login_ip = models.CharField(max_length=32, null=True, verbose_name=_("db:account:user last login ip"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("db:account:Account")
        verbose_name_plural = verbose_name
        db_table = "account"


class MessageLogModel(BaseModel):
    """
    message log table.
    """
    CATEGORY_NOTIFY = 0

    CATEGORY_NOTIFIES = (
        (CATEGORY_NOTIFY, _("db:MessageLog: category notify")),
    )
    CATEGORY_NOTIFIES_DICT = dict(CATEGORY_NOTIFIES)

    mobile = models.CharField(
        max_length=16, db_index=True, null=False, verbose_name=_("db:MessageLog:message mobile")
    )
    content = models.TextField(null=False, verbose_name=_("db:MessageLog:message content"))
    category = models.SmallIntegerField(default=0, verbose_name=_("db:MessageLog:message category"))
    success = models.BooleanField(default=False, verbose_name=_("db:MessageLog: message send status"))
    request_time = models.DateTimeField(verbose_name=_("db:MessageLog: request time"))
    response = models.TextField(null=True, verbose_name=_("db:MessageLog: send message response"))
    response_time = models.DateTimeField(null=True, verbose_name=_("db:MessageLog: response time"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("db:account:MessageLog")
        verbose_name_plural = verbose_name
        db_table = "message_log"

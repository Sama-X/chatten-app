"""
User model module.
"""
from django.db import models
from base.models import BaseModel


class AccountModel(BaseModel):
    """
    Account table.
    """
    mobile = models.CharField(max_length=16, unique=True, null=False)
    password = models.CharField(max_length=512, null=True)
    nickname = models.CharField(max_length=32, null=True)
    avatar = models.CharField(max_length=128, null=True)
    experience = models.SmallIntegerField(default=10, verbose_name="experience times")
    is_vip = models.BooleanField(default=False)
    login_time = models.DateTimeField(null=True, verbose_name="last login time")
    login_ip = models.CharField(max_length=32, null=True, verbose_name="last login ip addr")

    class Meta:
        """
        Meta
        """
        verbose_name = "Account"
        verbose_name_plural = verbose_name
        db_table = "account"

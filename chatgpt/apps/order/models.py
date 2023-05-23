"""
Order module.
"""
from django.db import models

from django.utils.translation import gettext as _

from base.models import BaseModel


class OrderPackageModel(BaseModel):
    """
    order package
    """

    CATEGORY_TRANSIENT = 0
    CATEGORY_PERSISTENCE = 1

    CATEGORIES = (
        (CATEGORY_TRANSIENT, 'transient'),
        (CATEGORY_PERSISTENCE, 'persistence'),
    )
    CATEGORIES_DICT = dict(CATEGORIES)

    name = models.CharField(max_length=32, blank=False, db_index=True, null=False, verbose_name=_("package name"))
    category = models.SmallIntegerField(default=CATEGORY_TRANSIENT, null=False, verbose_name=_("package category"))
    usage_days = models.SmallIntegerField(default=0, null=False, verbose_name=_("package usage days"))
    usage_count = models.IntegerField(default=0, null=False, verbose_name=_("package usage count"))
    price = models.FloatField(default=0.0, verbose_name=_("package price"))
    priority = models.IntegerField(default=1, db_index=True, verbose_name=_("package sort priority"))


    class Meta:
        """
        Meta
        """
        verbose_name = 'OrderPackageModel'
        verbose_name_plural = verbose_name
        db_table = "order_package"


class OrderModel(BaseModel):
    """
    order
    """
    STATUS_PENDING = 0
    STATUS_SUCCESS = 10
    STATUS_FAILURE = 99

    STATUS = (
        (STATUS_PENDING, _("unpaid")),
        (STATUS_SUCCESS, _("success")),
        (STATUS_FAILURE, _("failure")),
    )
    STATUS_DICT = dict(STATUS)

    METHOD_ALIPAY = 1
    METHOD_WECHAT = 2
    METHOD_POINTS = 99

    METHODS = (
        (METHOD_ALIPAY, _("alipay")),
        (METHOD_WECHAT, _("wechat")),
        (METHOD_POINTS, _("points")),
    )
    METHODS_DICT = dict(METHODS)

    user_id = models.BigIntegerField(db_index=True, null=False, verbose_name=_("user account id"))
    package_id = models.BigIntegerField(db_index=True, null=False, verbose_name=_("order package id"))
    quantity = models.IntegerField(default=1, verbose_name=_("order quantity"))
    actual_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name=_("order actual price"))
    status = models.SmallIntegerField(default=STATUS_PENDING, db_index=True, verbose_name=_("order status"))
    status_note = models.CharField(max_length=64, verbose_name=_("order status note"))
    payment_time = models.DateTimeField(null=True, verbose_name=_("order payment time"))
    payment_method = models.SmallIntegerField(default=METHOD_ALIPAY, verbose_name=_("order pay method"))

    out_trade_no = models.CharField(max_length=32, blank=False, db_index=True, null=False, verbose_name=_("out_trade_no name"))
    transaction_id = models.CharField(max_length=32, blank=False, db_index=True, null=True, verbose_name=_("transaction_id"))

    class Meta:
        """
        Meta
        """
        verbose_name = 'OrderModel'
        verbose_name_plural = verbose_name
        db_table = "order"

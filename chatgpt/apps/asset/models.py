"""
asset model.
"""
from datetime import datetime
from unicodedata import category
from django.utils.translation import gettext as _

from django.db import models

from base.models import BaseModel


class PointsModel(BaseModel):
    """
    points table.
    """

    user_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("user account id"))
    total = models.BigIntegerField(default=0, verbose_name=_("total points"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("Points")
        verbose_name_plural = verbose_name
        db_table = "asset_points"

    @classmethod
    def add_point(cls, user_id, amount, note=None):
        """
        add point to user.
        """
        obj = cls.objects.filter(user_id=user_id).first()
        if not obj:
            obj = cls.objects.create(
                user_id=user_id,
                total=amount
            )
        else:
            obj.total += amount
            obj.save()

        PointsLogModel.objects.create(
            user_id=user_id,
            point_id=obj.id,
            category=PointsLogModel.CATEGORY_ADD,
            amount=amount,
            note=note
        )


class PointsLogModel(BaseModel):
    """
    points log table.
    """
    CATEGORY_ADD = 1
    CATEGORY_SUB = -1

    CATEGORIES = (
        (CATEGORY_ADD, _("increase")),
        (CATEGORY_SUB, _("reduce")),
    )
    CATEGORY_DICT = dict(CATEGORIES)

    user_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("user account id"))
    point_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("points foreignkey id"))
    category = models.SmallIntegerField(default=CATEGORY_ADD, verbose_name=_("points change category"))
    amount = models.BigIntegerField(default=0, verbose_name=_("The number of points changed this time"))
    note = models.CharField(max_length=256, null=True, verbose_name=_("Notes on integral changes"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("PointsLog")
        verbose_name_plural = verbose_name
        db_table = "asset_points_log"


class PointsWithdrawModel(BaseModel):
    """
    Points withdraw.
    """
    STATUS_PENDING = 0
    STATUS_REFUNDING = 5
    STATUS_SUCCESS = 10
    STATUS_FAILURE = 11

    STATUSES = (
        (STATUS_PENDING, _("peding review")),
        (STATUS_REFUNDING, _("refund in progress")),
        (STATUS_SUCCESS, _("success")),
        (STATUS_FAILURE, _("failure")),
    )

    STATUS_DICT = dict(STATUSES)

    user_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("user account id"))
    realname = models.CharField(max_length=64, verbose_name=_("The real name of the withdrawing person"))
    contact = models.CharField(max_length=256, null=True, verbose_name=_("Contact information"))
    openid = models.CharField(max_length=128, null=True, verbose_name=_("wechat openid"))
    point = models.BigIntegerField(default=0, verbose_name=_("The number of points changed this time"))
    amount = models.FloatField(default=0, verbose_name=_("The amount exchanged"))
    ratio = models.FloatField(default=0, verbose_name=_("Ratio of points to cash"))
    status = models.SmallIntegerField(default=STATUS_PENDING, db_index=True, verbose_name=_("withdraw status"))
    audit_user_id = models.BigIntegerField(null=True, db_index=True, verbose_name=_("withdraw auditor"))
    audit_time = models.DateTimeField(null=True, verbose_name=_("withdraw audit time"))
    finish_time = models.DateTimeField(null=True, verbose_name=_("withdraw finish time"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("PointsWithdraw")
        verbose_name_plural = verbose_name
        db_table = "asset_points_withdraw"


class O2OPaymentModel(BaseModel):
    """
    o2o payment.
    """
    user_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("user account id"))
    transient_expire_time = models.DateTimeField(default=datetime.now, db_index=True,
                                                 verbose_name=_("Transient expiration time"))
    transient_usage_count = models.IntegerField(default=0, verbose_name=_("Transient expiration usage count"))
    persistence_usage_count = models.IntegerField(default=0, verbose_name=_("Persistence expiration usage count"))
    free_expire_time = models.DateTimeField(default=datetime.now, db_index=True, verbose_name=_("free expiration time"))
    free_usage_count = models.IntegerField(default=0, verbose_name=_("Free usage count"))
    is_enable = models.BooleanField(default=True, db_index=True, verbose_name=_("Whether it is available or not"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("O2OPayment")
        verbose_name_plural = verbose_name
        db_table = "asset_o2opayment"


class O2OPaymentLogModel(BaseModel):
    """
    o2o payment log.
    """
    CATEGORY_EXPIRED = -2
    CATEGORY_CONSUME = -1
    CATEGORY_FREE = 1
    CATEGORY_BUY = 2
    CATEGORY_REWARD = 3
    CATEGORY_EXCHANGE = 4

    CATEGORIES = (
        (CATEGORY_EXPIRED, _("expired")),
        (CATEGORY_CONSUME, _("consume")),
        (CATEGORY_FREE, _("free")),
        (CATEGORY_BUY, _("buy")),
        (CATEGORY_REWARD, _("reward")),
        (CATEGORY_EXCHANGE, _("exchange"))
    )
    CATEGORIES_DICT = dict(CATEGORIES)

    user_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("user account id"))
    payment_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("o2opayment id"))
    category = models.SmallIntegerField(default=CATEGORY_FREE, db_index=True, verbose_name=_("log category"))
    expire_time = models.DateTimeField(null=True, default=datetime.now, db_index=True,
                                       verbose_name=_("expiration time"))
    usage_count = models.IntegerField(null=False, default=0, verbose_name=_("current usage count"))
    note = models.CharField(max_length=256, null=True, verbose_name=_("Notes on payment log"))
    order_id = models.BigIntegerField(null=True, db_index=True, verbose_name=_("buy order id"))
    record_id = models.BigIntegerField(null=True, db_index=True, verbose_name=_("consume record id"))

    class Meta:
        """
        Meta
        """
        verbose_name = _("O2OPaymentLog")
        verbose_name_plural = verbose_name
        db_table = "asset_o2opayment_log"

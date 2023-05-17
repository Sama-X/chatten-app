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
    CATEGORY_CONSUME = -1
    CATEGORY_FREE = 1
    CATEGORY_BUY = 2
    CATEGORY_REWARD = 3

    CATEGORIES = (
        (CATEGORY_CONSUME, _("consume")),
        (CATEGORY_FREE, _("free")),
        (CATEGORY_BUY, _("buy")),
        (CATEGORY_REWARD, _("reward")),
    )
    CATEGORIES_DICT = dict(CATEGORIES)

    user_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("user account id"))
    payment_id = models.BigIntegerField(null=False, db_index=True, verbose_name=_("o2opayment id"))
    category = models.SmallIntegerField(default=CATEGORY_FREE, db_index=True, verbose_name=_("log category"))
    expire_time = models.DateTimeField(default=datetime.now, db_index=True, verbose_name=_("expiration time"))
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

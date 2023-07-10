"""
admin serializer.
"""
from django.utils.translation import gettext_lazy as _

from rest_framework import serializers
from base.serializer import BaseQuery


class AdminWithdrawQuery(BaseQuery):
    """
    withdraw query.
    """
    status = serializers.IntegerField(allow_null=True, required=False, help_text=_("point withdraw status"))


class PointsLogQuery(BaseQuery):
    """
    points log query.
    """
    user_id = serializers.IntegerField(required=False, allow_null=True, help_text=_("order user id"))


class RechargeSerializer(serializers.Serializer):
    """
    recharge serializer.
    """
    mobiles = serializers.ListField(
        child=serializers.CharField(max_length=32),
        min_length=1,
        required=True, allow_null=False, help_text=_("mobile phone number")
    )
    times = serializers.IntegerField(required=True, min_value=1, allow_null=False, help_text=_("recharge times"))

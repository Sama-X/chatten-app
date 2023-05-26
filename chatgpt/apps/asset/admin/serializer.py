"""
admin serializer.
"""
from django.utils.translation import gettext as _

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


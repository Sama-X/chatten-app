"""
asset serializer.
"""
from django.utils.translation import gettext as _

from rest_framework import serializers
from asset.models import PointsWithdrawModel

from base.serializer import BaseQuery


class WithdrawQuery(BaseQuery):
    """
    withdraw query.
    """
    status = serializers.IntegerField(allow_null=True, required=False, help_text=_("point withdraw status"))


class WithdrawSerializer(serializers.ModelSerializer):
    """
    withdraw list.
    """

    status_name = serializers.SerializerMethodField()
    add_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore
    audit_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore
    finish_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore

    def get_status_name(self, obj):
        """
        get status name.
        """
        return PointsWithdrawModel.STATUS_DICT.get(obj.status)

    class Meta:
        """
        meta class.
        """
        model = PointsWithdrawModel
        fields = (
            'id','realname', 'contact', 'point', 'amount', 'ratio', 'status', 'status_name',
            'audit_time', 'finish_time', 'add_time'
        )


class CreateWithdrawSerializer(serializers.Serializer):
    """
    create withdraw.
    """
    realname = serializers.CharField(
        max_length=32, required=True, allow_blank=False, allow_null=False,
        help_text=_("The real name of the withdrawing person")
    )
    contact = serializers.CharField(
        max_length=32, required=True, allow_blank=False, allow_null=False,
        help_text=_("Withdrawal person's contact information")
    )
    point = serializers.IntegerField(
        required=True, min_value=1, allow_null=False, help_text=_("Withdrawal point")
    )
"""
base serializer.
"""

from django.utils.translation import gettext as _
from rest_framework import serializers


class BaseQuery(serializers.Serializer):
    """
    Base query.
    """
    page = serializers.IntegerField(allow_null=True, required=False, default=1, help_text=_("serializer: page"))
    offset = serializers.IntegerField(allow_null=True, required=False, default=20, help_text=_("serializer: offset"))
    order = serializers.CharField(allow_null=True, required=False, help_text=_("serializer: order"))

"""
order admin serializer.
"""
from django.utils.translation import gettext as _

from rest_framework import serializers

from users.models import ConfigModel


class ConfigSeriazlier(serializers.ModelSerializer):
    """
    config serializer.
    """
    add_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore

    class Meta:
        """
        meta class.
        """
        model = ConfigModel
        fields = (
            'id', 'name', 'value', 'value_type', 'description', 'add_time'
        )


class UpdateConfigSerializer(serializers.Serializer):
    """
    update config.
    """
    value = serializers.CharField(
        required=True, allow_null=True, help_text=_("config item value")
    )
    description = serializers.CharField(
        required=True, allow_null=False, help_text=_("config item description")
    )

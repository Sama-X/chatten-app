"""
order admin serializer.
"""
from django.utils.translation import gettext as _

from rest_framework import serializers
from base.serializer import BaseQuery

from users.models import ConfigModel, InviteLogModel


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


class InviteLogSerializer(serializers.ModelSerializer):
    """
    invite log.
    """
    invite_level = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    inviter_user_name = serializers.SerializerMethodField()
    add_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore

    def get_invite_level(self, obj):
        """
        invite level.
        """
        if obj.super_inviter_user_id:
            return 2
        return 1

    def get_user_name(self, obj):
        """
        get user name.
        """
        user = self.context.get('user_dict', {}).get(obj.user_id)
        if not user:
            return None

        return user.nickname or user.username

    def get_inviter_user_name(self, obj):
        """
        get inviter user name.
        """
        if not obj.super_inviter_user_id:
            return None

        user = self.context.get('user_dict', {}).get(obj.inviter_user_id)
        if not user:
            return None

        return user.nickname or user.username

    class Meta:
        """
        meta class.
        """
        model = InviteLogModel
        fields = (
            'id', 'user_id', 'user_name', 'inviter_user_id',
            'inviter_user_name', 'invite_level', 'add_time'
        )


class ReportQuery(BaseQuery):
    """
    report query.
    """
    start_date = serializers.DateField(allow_null=True, required=False, input_formats=['%Y-%m-%d'])
    end_date = serializers.DateField(allow_null=True, required=False, input_formats=['%Y-%m-%d'])


class AdminLoginSerializer(serializers.Serializer):
    """
    Login serializer.
    """
    username = serializers.CharField(
        required=True, allow_null=False, max_length=32, help_text=_("username")
    )
    password = serializers.CharField(max_length=32, required=False, help_text=_("password"))

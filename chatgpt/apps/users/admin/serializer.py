"""
order admin serializer.
"""
from django.utils.translation import gettext_lazy as _

from rest_framework import serializers
from base.serializer import BaseQuery

from users.models import AccountModel, ConfigModel, InviteLogModel


class ConfigSeriazlier(serializers.ModelSerializer):
    """
    config serializer.
    """
    add_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore
    description = serializers.SerializerMethodField()

    def get_description(self, obj):
        """
        get description.
        """
        print(obj.description)
        print('trans = ', _(obj.description))
        return _(obj.description)

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


class InviteLogSerializer(serializers.ModelSerializer):
    """
    invite log.
    """
    invite_level = serializers.SerializerMethodField()
    level1_user_id = serializers.SerializerMethodField()
    level1_user_name = serializers.SerializerMethodField()
    level2_user_id = serializers.SerializerMethodField()
    level2_user_name = serializers.SerializerMethodField()
    add_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore

    def get_invite_level(self, obj):
        """
        invite level.
        """
        current_user_id = self.context.get('current_user_id')
        if obj.super_inviter_user_id == current_user_id:
            return 2
        return 1

    def get_level1_user_id(self, obj):
        """
        get level1 user id
        """
        if self.get_invite_level(obj) == 2:
            return obj.inviter_user_id

        return obj.user_id

    def get_level2_user_id(self, obj):
        """
        get level2 user id
        """
        if self.get_invite_level(obj) == 2:
            return obj.user_id

        return None

    def get_level1_user_name(self, obj):
        """
        get user name.
        """
        user_id = self.get_level1_user_id(obj)
        user = self.context.get('user_dict', {}).get(user_id)
        if not user:
            return None

        return user.nickname or user.username

    def get_level2_user_name(self, obj):
        """
        get inviter user name.
        """
        user_id = self.get_level2_user_id(obj)
        if not user_id:
            return None

        user = self.context.get('user_dict', {}).get(user_id)
        if not user:
            return None

        return user.nickname or user.username

    class Meta:
        """
        meta class.
        """
        model = InviteLogModel
        fields = (
            'id', 'level1_user_id', 'level1_user_name', 'level2_user_id', 'level2_user_name',
            'invite_level', 'add_time'
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


class AdminAccountSerializer(serializers.ModelSerializer):
    """
    account serializer.
    """

    add_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore
    login_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore
    level1_invite_total = serializers.SerializerMethodField()
    level2_invite_total = serializers.SerializerMethodField()
    points = serializers.SerializerMethodField()
    transient_expire_time = serializers.SerializerMethodField()
    transient_usage_count = serializers.SerializerMethodField()
    persistence_usage_count = serializers.SerializerMethodField()
    free_expire_time = serializers.SerializerMethodField()
    free_usage_count = serializers.SerializerMethodField()

    def get_level1_invite_total(self, obj):
        """
        direct invite total
        """
        return self.context.get('direct_dict', {}).get(obj.id) or 0

    def get_level2_invite_total(self, obj):
        """
        indirect invite total
        """
        return self.context.get('indirect_dict', {}).get(obj.id) or 0

    def get_points(self, obj):
        """
        points
        """
        return self.context.get('point_dict', {}).get(obj.id) or 0

    def get_asset_obj(self, obj):
        """
        get o2opayment object.
        """
        return self.context.get('payment_dict', {}).get(obj.id)

    def get_transient_expire_time(self, obj):
        """
        transient expire time.
        """
        payment = self.get_asset_obj(obj)
        if payment and payment.transient_expire_time:
            return payment.transient_expire_time.strftime('%Y-%m-%d %H:%M:%S')

        return None

    def get_transient_usage_count(self, obj):
        """
        transient usage count
        """
        payment = self.get_asset_obj(obj)
        return payment.transient_usage_count if payment else None

    def get_persistence_usage_count(self, obj):
        """
        persistence usage count
        """
        payment = self.get_asset_obj(obj)
        return payment.persistence_usage_count if payment else None

    def get_free_expire_time(self, obj):
        """
        free expire time
        """
        payment = self.get_asset_obj(obj)
        if payment and payment.free_expire_time:
            return payment.free_expire_time.strftime('%Y-%m-%d %H:%M:%S')

        return None

    def get_free_usage_count(self, obj):
        """
        free usage count
        """
        payment = self.get_asset_obj(obj)
        return payment.free_usage_count if payment else None

    class Meta:
        """
        meta class.
        """
        model = AccountModel
        fields = (
            'id', 'username', 'mobile', 'nickname', 'login_time', 'login_ip', 'add_time',
            'level1_invite_total', 'level2_invite_total', 'points', 'transient_expire_time',
            'transient_usage_count', 'persistence_usage_count', 'free_expire_time', 'free_usage_count'
        )

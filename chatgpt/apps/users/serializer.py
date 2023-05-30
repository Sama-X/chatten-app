"""
Serializer module.
"""
import re
from django.utils.translation import gettext as _

from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from base.serializer import BaseQuery

from users.models import FeedbackModel


class LoginSerializer(serializers.Serializer):
    """
    Login serializer.
    """
    mobile = serializers.CharField(
        required=True, allow_null=False, max_length=32, help_text=_("mobile phone number")
    )
    code = serializers.CharField(max_length=8, required=False, help_text=_("verification code"))
    password = serializers.CharField(max_length=32, required=False, help_text=_("password"))


class CreateAccountSerializer(serializers.Serializer):
    """
    create account serializer.
    """
    username = serializers.CharField(
        required=True, allow_null=False, max_length=32, help_text=_("username")
    )
    password = serializers.CharField(
        required=True, allow_null=False, max_length=32, help_text=_("password")
    )
    invite_code = serializers.CharField(
        required=False, allow_null=True, max_length=32, help_text=_("invite code")
    )


class UpdateAccountSerializer(serializers.Serializer):
    """
    update account serializer.
    """
    nickname = serializers.CharField(
        required=True, allow_null=False, max_length=32, help_text=_("nickname")
    )
    openid = serializers.CharField(
        required=True, allow_null=False, max_length=32, help_text=_("openid")
    )


class SendSmsMessageSerializer(serializers.Serializer):
    """
    send sms message serializer.
    """
    mobile = serializers.CharField(
        required=True, allow_null=False, max_length=32, help_text=_("mobile phone number")
    )

    def validate_mobile(self, value: str):
        """
        validate mobile.
        """
        reg = r'^1\d{10}$'
        flag = re.match(reg, value)
        if not flag:
            raise ValidationError(_("Incorrect format of mobile phone number"))

        return value


class FeedbackSerializer(serializers.ModelSerializer):
    """
    feedback serializer
    """
    add_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore
    reply_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore
    user_name = serializers.SerializerMethodField()
    status_name = serializers.SerializerMethodField()


    def get_user_name(self, obj):
        """ get user_name """
        user_obj = self.context.get('user_dict', {}).get(obj.user_id)
        return user_obj.nickname or user_obj.username if user_obj else None

    def get_status_name(self, obj):
        """ get status_name """
        return FeedbackModel.STATUS_DICT.get(obj.status)

    class Meta:
        """
        meta
        """
        model = FeedbackModel
        fields = (
            'id', 'user_id', 'user_name', 'title', 'content', 'status', 'status_name',
            'reply', 'reply_user_id', 'reply_time', 'add_time'
        )


class FeedbackQuery(BaseQuery):
    """
    feedback query.
    """

    status = serializers.IntegerField(allow_null=True, required=False, help_text=_("feedback status"))
    user_id = serializers.IntegerField(required=False, allow_null=True, help_text=_("user id"))


class CreateFeedbackSerializer(serializers.Serializer):
    """
    create feedback serializer.
    """
    title = serializers.CharField(
        required=True, allow_null=False, max_length=32, help_text=_("feedback title")
    )
    content = serializers.CharField(
        required=True, allow_null=False, help_text=_("feedback content")
    )


class ReplyFeedbackSerializer(serializers.Serializer):
    """
    reply feedback serializer.
    """
    content = serializers.CharField(
        required=True, allow_null=False, help_text=_("feedback reply content")
    )

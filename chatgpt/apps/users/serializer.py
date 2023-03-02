"""
Serializer module.
"""
import re
from django.utils.translation import gettext as _

from rest_framework import serializers
from rest_framework.exceptions import ValidationError


class LoginSerializer(serializers.Serializer):
    """
    Login serializer.
    """
    mobile = serializers.CharField(
        required=True, allow_null=False, max_length=32, help_text=_("mobile phone number")
    )
    code = serializers.CharField(max_length=8, help_text=_("verification code"))
    password = serializers.CharField(max_length=32, help_text=_("password"))


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

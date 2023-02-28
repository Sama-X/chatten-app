"""
Serializer module.
"""
from django.utils.translation import gettext as _

from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    """
    Login serializer.
    """
    mobile = serializers.CharField(
        required=True, allow_none=False, max_length=32, verbose_name=_("mobile phone number")
    )
    code = serializers.CharField(required=True, allow_none=False, max_length=8, verbose_name=_("verification code"))


class SendSmsMessageSerializer(serializers.Serializer):
    """
    send sms message serializer.
    """
    mobile = serializers.CharField(
        required=True, allow_none=False, max_length=32, verbose_name=_("mobile phone number")
    )

"""
chat serializer.
"""
from django.utils.translation import gettext as _
from rest_framework import serializers

from order.models import OrderModel


class OrderListSerializer(serializers.ModelSerializer):
    """
    Chat record serializer.
    """

    question_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S')  # type: ignore
    response_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S')  # type: ignore
    add_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S')  # type: ignore
    msg_type_name = serializers.SerializerMethodField()

    def get_msg_type_name(self, obj):
        """
        get msg type name.
        """
        return OrderModel.MSG_TYPES_DICT.get(obj.msg_type)

    class Meta:
        """
        Meta class.
        """
        model = OrderModel
        fields = (
            'msg_type', 'msg_type_name', 'question', 'answer', 'approval',
            'question_time', 'response_time', 'add_time'
        )


class CreateOrderSerializer(serializers.Serializer):
    """
    create chatgpt key.
    """
    key = serializers.CharField(allow_null=False, required=True, help_text=(_("serializer:chatgpt key")))


"""
chat serializer.
"""
from django.utils.translation import gettext as _
from rest_framework import serializers

from chat.models import ChatRecordModel


class BaseQuery(serializers.Serializer):
    """
    Base query.
    """
    page = serializers.IntegerField(allow_null=True, required=False, default=1, help_text=_("serializer: page"))
    offset = serializers.IntegerField(allow_null=True, required=False, default=20, help_text=_("serializer: offset"))
    order = serializers.CharField(allow_null=True, required=False, help_text=_("serializer: order"))


class CreateQuestionForm(serializers.Serializer):
    """
    question form.
    """
    question = serializers.CharField(required=True, allow_null=False, help_text=_("serializer: question"))


class ChatRecordSerializer(serializers.ModelSerializer):
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
        return ChatRecordModel.MSG_TYPES_DICT.get(obj.msg_type)

    class Meta:
        """
        Meta class.
        """
        model = ChatRecordModel
        fields = (
            'msg_type', 'msg_type_name', 'question', 'answer', 'approval',
            'question_time', 'response_time', 'add_time'
        )


class CreateChatgptKeySerializer(serializers.Serializer):
    """
    create chatgpt key.
    """
    key = serializers.CharField(allow_null=False, required=True, help_text=(_("serializer:chatgpt key")))

"""
chat serializer.
"""
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers

from chat.models import ChatRecordModel, ChatTopicModel


class CreateQuestionForm(serializers.Serializer):
    """
    question form.
    """
    question = serializers.CharField(required=True, allow_null=False, help_text=_("serializer: question"))
    topic_id = serializers.IntegerField(allow_null=True, required=False, help_text=_("serializer: chat topic id"))
    channel = serializers.CharField(allow_null=True, allow_blank=True, required=False, help_text=_("serializer: channel"))


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


class ChatTopicSerializer(serializers.ModelSerializer):
    """
    Chat topic serializer.
    """

    add_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S')  # type: ignore

    class Meta:
        """
        Meta class.
        """
        model = ChatTopicModel
        fields = (
            'id', 'title', 'add_time'
        )

"""
chat api module.
"""

from datetime import datetime
import json

from asgiref.sync import async_to_sync

from rest_framework import viewsets, mixins
from rest_framework.decorators import action

from base.ai import AIHelper
from base.exception import ChatErrorCode, SystemErrorCode
from base.middleware import AnonymousAuthentication
from base.response import APIResponse, SerializerErrorResponse
from chat.models import ChatRecordModel, ChatTopicModel, ChatgptKeyModel

from chat.serializer import BaseQuery, ChatRecordSerializer, ChatTopicSerializer, CreateChatgptKeySerializer, CreateQuestionForm
from users.models import AccountModel


class ChatViewset(viewsets.GenericViewSet):
    """
    create chat api.
    """

    authentication_classes = [AnonymousAuthentication,]

    @async_to_sync
    @action(methods=["POST"], detail=False)
    async def question(self, request, *args, **kwargs):
        """
        send question api.
        url: /api/v1/chat/question
        """
        serializer = CreateQuestionForm(data=request.data)
        if not serializer.is_valid():
            return SerializerErrorResponse(serializer, SystemErrorCode.HTTP_400_BAD_REQUEST)

        question = serializer.validated_data["question"] # type: ignore
        topic_id = serializer.validated_data.get('topic_id') # type: ignore

        current_total = ChatRecordModel.objects.filter(
            success=True,
            user_id=request.user.id
        ).count()

        if current_total >= request.user.experience:
            return APIResponse(code=ChatErrorCode.CHAT_ROBOT_NO_EXPERIENCES)

        messages = []
        if topic_id:
            messages = ChatRecordModel.get_gpt_chat_logs(request.user.id, topic_id)

        obj = ChatRecordModel.objects.create(
            user_id=request.user.id,
            msg_type=ChatRecordModel.MSG_TYPE_TEXT,
            question=question,
            answer=None,
            question_time=datetime.now()
        )

        resp = await AIHelper.send_msg(question, histories=messages)
        choices = resp.get('choices', [])
        if len(choices) > 0:
            if not topic_id:
                topic = ChatTopicModel.objects.create(
                    title=question[:125],
                    user_id=request.user.id
                )
                topic_id = topic.id

            obj.chat_topic_id = topic_id
            obj.answer = choices[0].get('message', {}).get('content')
            obj.success = True

        obj.chatgpt_key_id = resp['key_id']
        obj.response = json.dumps(resp, ensure_ascii=False)
        obj.response_time = datetime.now()
        obj.prompt_tokens = resp.get('usage', {}).get('prompt_tokens', 0)
        obj.resp_tokens = resp.get('usage', {}).get('completion_tokens', 0)
        obj.total_tokens = resp.get('usage', {}).get('total_tokens', 0)
        obj.save()

        if obj.answer:
            return APIResponse(result={
                "answer": obj.answer,
                "topic_id": topic_id
            })
        return APIResponse(code=ChatErrorCode.CHAT_ROBOT_NO_RESP)


class ChatgptKeyViewSet(viewsets.GenericViewSet):
    """
    chatgpt register.
    """

    authentication_classes = [AnonymousAuthentication,]

    @action(methods=['POST'], detail=False)
    def keys(self, request, *args, **kwargs):
        """
        register chatgpt key.
        url: /api/v1/chatgpt/keys
        """
        serializer = CreateChatgptKeySerializer(data=request.data)
        if not serializer.is_valid():
            return SerializerErrorResponse(serializer, SystemErrorCode.HTTP_400_BAD_REQUEST)

        if request.user.user_type != AccountModel.USER_TYPE_NORMAL:
            return APIResponse(ChatErrorCode.CHATGPT_KEY_UNSUPPORT_ANONY_USER)

        key = serializer.validated_data["key"]  # type: ignore
        success = AIHelper.check_api_key(key)


        if success:
            obj = ChatgptKeyModel.objects.filter(key=key).first()
            if obj and obj.enable:
                return APIResponse(code=ChatErrorCode.CHATGPT_KEY_EXISTS)

            if obj:
                obj.enable = True
                obj.save()
            else:
                ChatgptKeyModel.objects.create(
                    user_id=request.user.id,
                    key=key,
                )
            # dynamic update key
            if AIHelper.strategy:
                AIHelper.strategy.release_key(key)

            return APIResponse()

        return APIResponse(code=ChatErrorCode.CHATGPT_KEY_INVALID)


class ChatTopicViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    chat topic api.
    """

    authentication_classes = [AnonymousAuthentication,]

    def list(self, request, *args, **kwargs):
        """
        get chat topic list
        url: /api/v1/chat/topics/
        """
        query = BaseQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or '-id'  # type: ignore
        user_id = request.user.id

        order_fields = []
        support_fields = [i.name for i in ChatTopicModel._meta.fields]
        for field in order.split(','):
            if field.replace('-', '') in support_fields:
                order_fields.append(field)
        base = ChatTopicModel.objects.filter(
            user_id=user_id,
            is_delete=False
        )
        total = base.count()
        if order_fields:
            base = base.order_by(*order_fields)

        base = base[(page - 1) * offset: page * offset]

        data = ChatTopicSerializer(base, many=True).data

        total_experience = ChatRecordModel.objects.filter(
            user_id=request.user.id,
            is_delete=False,
            success=True
        ).count()

        return APIResponse(
            result=data, total=total, total_experience=total_experience,
            experience=request.user.experience
        )

    @action(methods=["GET"], detail=True)
    def records(self, request, *args, **kwargs):
        """
        get chat topic records
        url: /api/v1/chat/topics/<topic_id>/records/
        """
        topic_id = kwargs.get('pk')
        query = BaseQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or '-id'  # type: ignore
        user_id = request.user.id

        order_fields = []
        support_fields = [i.name for i in ChatRecordModel._meta.fields]
        for field in order.split(','):
            if field.replace('-', '') in support_fields:
                order_fields.append(field)

        base = ChatRecordModel.objects.filter(
            user_id=user_id,
            is_delete=False,
            success=True,
            chat_topic_id=topic_id
        )
        total = base.count()
        if order_fields:
            base = base.order_by(*order_fields)

        base = base[(page - 1) * offset: page * offset]

        data = ChatRecordSerializer(base, many=True).data

        return APIResponse(result=data, total=total)

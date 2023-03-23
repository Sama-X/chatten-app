"""
chat api module.
"""

from datetime import datetime
import json

from asgiref.sync import async_to_sync

from rest_framework import viewsets
from rest_framework.decorators import action

from base.ai import AIHelper
from base.exception import ChatErrorCode, SystemErrorCode
from base.middleware import AnonymousAuthentication
from base.response import APIResponse, SerializerErrorResponse
from chat.models import ChatRecordModel

from chat.serializer import BaseQuery, ChatRecordSerializer, CreateQuestionForm


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

        messages = ChatRecordModel.get_gpt_chat_logs(request.user.id, 1000)

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
            obj.answer = choices[0].get('message', {}).get('content')
            obj.success = True
        obj.response = json.dumps(resp, ensure_ascii=False)
        obj.response_time = datetime.now()
        obj.prompt_tokens = resp.get('usage', {}).get('prompt_tokens', 0)
        obj.resp_tokens = resp.get('usage', {}).get('completion_tokens', 0)
        obj.total_tokens = resp.get('usage', {}).get('total_tokens', 0)
        obj.save()

        if obj.answer:
            return APIResponse(result={
                "answer": obj.answer
            })
        return APIResponse(code=ChatErrorCode.CHAT_ROBOT_NO_RESP)

    @action(methods=["GET"], detail=False)
    def records(self, request, *args, **kwargs):
        """
        get chat records
        url: /api/v1/chat/records
        """
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
            success=True
        )
        total = base.count()
        if order_fields:
            base = base.order_by(*order_fields)
        base = base[(page - 1) * offset: page * offset]

        data = ChatRecordSerializer(base, many=True).data

        return APIResponse(result=data, total=total)

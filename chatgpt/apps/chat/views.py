"""
chat api module.
"""

from datetime import datetime
from rest_framework import viewsets
from rest_framework.decorators import action

from base.ai import AIHelper
from base.exception import ChatErrorCode
from base.response import APIResponse
from chat.models import ChatRecordModel

from chat.serializer import BaseQuery, ChatRecordSerializer, CreateQuestionForm


class ChatViewset(viewsets.GenericViewSet):
    """
    create chat api.
    """

    @action(methods=["POST"])
    def question(self, request, *args, **kwargs):
        """
        send question api.
        url: /api/v1/chat/question
        """
        serializer = CreateQuestionForm(data=request.json)
        serializer.is_valid(raise_exception=True)

        question = serializer.validated_data["question"] # type: ignore

        obj = ChatRecordModel.objects.create(
            user_id=1,
            msg_type=ChatRecordModel.MSG_TYPE_TEXT,
            question=question,
            answer=None,
            question_time=datetime.now()
        )
        obj.save()

        resp = AIHelper.send_msg(question)
        choices = resp.get('choices', [])
        if len(choices) > 0:
            obj.answer = choices[0].get('text')
        obj.response = resp
        obj.response_time = datetime.now()
        obj.save()

        if obj.answer:
            return APIResponse(msg=obj.answer)
        return APIResponse(code=ChatErrorCode.CHAT_ROBOT_NO_RESP)

    @action(methods=["GET"])
    def records(self, request, *args, **kwargs):
        """
        get chat records
        url: /api/v1/chat/records
        """
        query = BaseQuery(data=request.GET)
        query.is_valid(raise_exception=False)

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or '-id'  # type: ignore
        user_id = 1

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
        if order_fields:
            base = base.order_by(*order_fields)
        base = base[(page - 1) * offset: page * offset]

        data = ChatRecordSerializer(base, many=True).data

        return APIResponse(result=data)

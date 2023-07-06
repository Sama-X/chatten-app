"""
Celery task.
"""
import logging

from celery import shared_task

from django.utils.translation import gettext_lazy as _
from base.ai import AIHelper

from chat.models import ChatRecordModel, ChatTopicModel

logger = logging.getLogger(__name__)


@shared_task
def generate_topic_title(topic_id):
    """
    generate topic title
    """
    logger.info("[generate topic] start topic id: %s", topic_id)
    topic = ChatTopicModel.objects.filter(
        id=topic_id,
        success=False
    ).first()
    if not topic:
        return logger.warning("[generate topic] ignore topic id: %s", topic_id)

    chats = ChatRecordModel.objects.filter(
        success=True,
        chat_topic_id=topic_id
    )[:3]

    if not chats:
        return logger.warning("[generate topic] ignore reason: no chat record topic id: %s", topic_id)

    messages = []
    for chat in chats:
        messages.append({
            "role": "user",
            "content": chat.question
        })
        if chat.answer:
            messages.append({
                "role": "assistant",
                "content": chat.answer
            })

    helper = AIHelper()
    resp = helper.sync_send_msg(_('Extract an appropriate and concise title according to the previous language'), histories=messages)

    logger.info("[generate topic] genereate topic id: %s result: %s", topic_id, resp)

    choices = resp.get('choices', [])
    if len(choices) > 0:
        title = choices[0].get('message', {}).get('content', '').replace("\"", '')
        if len(title) >= 125:
            title = chats[0].question[:125]
        topic.title = title
        topic.success = len(chats) > 2
        topic.save()

    logger.info("[generate topic] finish topic id: %s", topic_id)

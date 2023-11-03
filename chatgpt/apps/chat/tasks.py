"""
Celery task.
"""
from datetime import datetime
import json
import logging

from celery import shared_task

from django.core.cache import cache
from django.utils.translation import gettext as _
from asset.models import O2OPaymentModel
from base.ai import AIHelper
from base.dfx import DFXClient

from chat.models import ChatRecordModel, ChatTopicModel
from users.models import AccountModel

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


@shared_task
def sync_dfx_map_name():
    """
    every day sync dfx map name.
    """
    logger.info("[sync dfx map name] start is init: %s", DFXClient.IS_INIT)

    item = DFXClient.get_store_name()
    if item.data != DFXClient.DFX_TOKEN:
        DFXClient.init()

    logger.info("[sync dfx map name] finish")


@shared_task
def sync_user_info_to_icp(user_id):
    """
    sync user info to icp server.
    """
    logger.info("[sync user info to icp] start user id: %s", user_id)
    user = AccountModel.objects.filter(id=user_id).first()
    if not user:
        return logger.warning("[sync user info to icp] ignore reason: no user id: %s", user_id)

    data = {
        'id': user.id,
        'username': user.username,
        'mobile': user.mobile,
        'nickname': user.nickname,
        'login_time': str(user.login_time),
        'login_ip': user.login_ip,
        'user_type': user.user_type,
        'openid': user.openid,
        'email': user.email,
        'transient_expire_time': None,
        'transient_usage_count': 0,
        'persistence_usage_count': 0,
        'free_expire_time': None,
        'free_usage_count': 0,
        'sync_time': str(datetime.now())
    }
    payment = O2OPaymentModel.objects.filter(user_id=user_id).first()
    if payment:
        data.update({
            'transient_expire_time': str(payment.transient_expire_time),
            'transient_usage_count': payment.transient_usage_count,
            'persistence_usage_count': payment.persistence_usage_count,
            'free_expire_time': str(payment.free_expire_time),
            'free_usage_count': payment.free_usage_count,
        })

    icp_user_info_key = f'user_info_{user_id}'
    result = None
    data = json.dumps(data, ensure_ascii=False)
    if DFXClient.get(icp_user_info_key).data:
        result = DFXClient.update(icp_user_info_key, data)
    else:
        result = DFXClient.add(icp_user_info_key, data)

    logger.info("[sync user info to icp] finish user id: %s result: %s", user_id, result.data)


@shared_task
def sync_user_chat_logs(topic_id):
    """
    sync user topic chat logs to icp server.
    """
    logger.info("[sync user chat logs] start topic id: %s", topic_id)
    topic = ChatTopicModel.objects.filter(id=topic_id).first()
    if not topic:
        return logger.warning("[sync user chat logs] ignore reason: no topic id: %s", topic_id)

    chat_objs = ChatRecordModel.objects.filter(
        success=True,
        chat_topic_id=topic_id
    ).all()

    if not chat_objs:
        return logger.warning("[sync user chat logs] ignore reason: no chat record topic id: %s", topic_id)

    data = {
        'topic': topic.title,
        'sync_time': str(datetime.now()),
        'chats': []
    }
    chats = []
    for item in chat_objs:
        chats.append({
            "question": item.question,
            "answer": item.answer,
            "question_time": str(item.question_time)
        })
    data['chats'] = chats

    data = json.dumps(data, ensure_ascii=False)

    key = f'chat_topic_{topic_id}'
    if DFXClient.get(key).data:
        result = DFXClient.update(key, data)
    else:
        result = DFXClient.add(key, data)

    logger.info("[sync user chat logs] finish topic id: %s result: %s", topic_id, result.data)


sync_dfx_map_name()

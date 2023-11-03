"""
Celery task.
"""
import json
import logging

from celery import shared_task
from django.conf import settings
from django.core.cache import cache
from django.db.models import Q
from django_redis import get_redis_connection
from apps.base.sama import SamaClient

from apps.users.service import UserService

logger = logging.getLogger(__name__)

SAMA_TASKS_KEY = "sama:task:pending"
EXECUTING_KEY = "task:executing:key"

@shared_task
def handle_sama_transfer():
    """
    handle sama transfer transaction.
    """
    logger.info("[execute sama transaction] start")
    exists = cache.get(EXECUTING_KEY)
    if exists:
        logger.warning("[execute sama transaction] ignore")
        return
    else:
        cache.set(EXECUTING_KEY, 1, 10)

    conn = get_redis_connection()
    total = conn.llen(SAMA_TASKS_KEY)
    if total > 0:
        user_id, sama_token, private_key = json.loads(conn.rpop(SAMA_TASKS_KEY, 1)[0])
        if not private_key:
            UserService.add_score(user_id, sama_token * settings.SAMA_UNIT, settings.CHAIN_SAMA)
        else:
            SamaClient.create_transaction_unconfirmed(
                settings.CHATGPT_WALLET, 1, private_key
            )
    if total > 1:
        handle_sama_transfer.apply_async(countdown=5)

    cache.delete(EXECUTING_KEY)
    logger.info("[execute sama transaction] success total: %s", total)

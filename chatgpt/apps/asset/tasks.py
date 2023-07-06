"""
Celery task.
"""
from datetime import datetime
import logging

from celery import shared_task

from django.db import transaction
from django.utils.translation import gettext_lazy as _

from asset.models import O2OPaymentLogModel, O2OPaymentModel

logger = logging.getLogger(__name__)


@shared_task
@transaction.atomic
def auto_clear_expired_payment():
    """
    auto clear expired payment every day
    """
    logger.info("[clear expired payment] start")
    payments = O2OPaymentModel.objects.filter(
        transient_expire_time__lte=datetime.now(),
        transient_usage_count__gt=0,
    ).all()
    for payment in payments:
        with transaction.atomic():
            usage_count = payment.transient_usage_count
            payment.transient_usage_count = 0
            payment.save()
            O2OPaymentLogModel.objects.create(
                user_id=payment.user_id,
                payment_id=payment.id,
                category=O2OPaymentLogModel.CATEGORY_EXPIRED,
                expire_time=payment.transient_expire_time,
                usage_count=usage_count,
                note=_('The order has expired')
            )

    logger.info("[clear expired payment] finish total: %s", len(payments))

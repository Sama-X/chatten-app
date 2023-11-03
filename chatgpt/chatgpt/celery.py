"""
异步任务模块.
"""

from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab


# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chatgpt.settings')

app = Celery('chatgpt')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()
app.conf.enable_utc = True
app.conf.timezone = "Asia/Shanghai"  # type: ignore
# Set scheduler task.

app.conf.beat_schedule = {
    'sync-handle-sama-transfer': {
        'task': 'users.tasks.handle_sama_transfer',
        'schedule': crontab(minute='*')
    },
    'auto-clear-expired-payment': {
        'task': 'asset.tasks.auto_clear_expired_payment',
        'schedule': crontab(hour="*/6", minute="0")
    },
    'sync-dfx-map-name': {
        'task': 'chat.tasks.sync_dfx_map_name',
        'schedule': crontab(hour="0", minute='0')
    }
}

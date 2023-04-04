"""
user router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from users.views import LoginViewSet, SmsMessageViewSet

router = DefaultRouter()
router.register(r'', LoginViewSet, basename="token")
router.register(r'', SmsMessageViewSet, basename="sms-code")

urlpatterns = [
    path(r'users/', include(router.urls)),
]

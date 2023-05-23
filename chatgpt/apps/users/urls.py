"""
user router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from users.views import InviteLogViewset, LoginViewSet, SmsMessageViewSet, UserProfileViewSet

router = DefaultRouter()
router.register(r'', LoginViewSet, basename="token")
router.register(r'', SmsMessageViewSet, basename="sms-code")
router.register(r'', UserProfileViewSet, basename="user-profile")
router.register(r'invite-logs', InviteLogViewset, "InviteLogViewset")

urlpatterns = [
    path(r'users/', include(router.urls)),
]

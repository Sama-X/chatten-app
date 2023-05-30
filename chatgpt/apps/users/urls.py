"""
user router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from users.views import FeedbackViewSet, InviteLogViewset, LoginViewSet, SmsMessageViewSet, UserProfileViewSet, WechatLoginViewSet, WechatProfileViewSet

router = DefaultRouter()
router.register(r'', LoginViewSet, basename="token")
router.register(r'', SmsMessageViewSet, basename="sms-code")
router.register(r'profile', UserProfileViewSet, basename="user-profile")
router.register(r'wechat-profile', WechatProfileViewSet, basename="WechatProfileViewSet")
router.register(r'invite-logs', InviteLogViewset, "InviteLogViewset")
router.register(r'wechat', WechatLoginViewSet, basename="WechatLoginViewSet")
router.register(r'feedback', FeedbackViewSet, basename="FeedbackViewSet")

urlpatterns = [
    path(r'users/', include(router.urls)),
]

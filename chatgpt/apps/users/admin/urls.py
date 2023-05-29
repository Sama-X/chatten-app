"""
user router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from users.admin.views import AdminLoginViewSet, AdminSummaryViewSet, AdminUserViewSet, ConfigViewSet


router = DefaultRouter()
router.register(r'configs', ConfigViewSet, basename="ConfigViewSet")
router.register(r'summary', AdminSummaryViewSet, basename="AdminSummaryViewSet")
router.register(r'token', AdminLoginViewSet, basename="AdminLoginViewSet")
router.register(r'users', AdminUserViewSet, basename='AdminUserViewSet')

urlpatterns = [
    path(r'', include(router.urls)),
]

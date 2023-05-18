"""
user router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from users.admin.views import AdminSummaryViewSet, ConfigViewSet


router = DefaultRouter()
router.register(r'configs', ConfigViewSet, basename="ConfigViewSet")
router.register(r'summary', AdminSummaryViewSet, basename="AdminSummaryViewSet")

urlpatterns = [
    path(r'', include(router.urls)),
]

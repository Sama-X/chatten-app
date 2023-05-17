"""
user router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from users.admin.views import ConfigViewSet


router = DefaultRouter()
router.register(r'', ConfigViewSet, basename="ConfigViewSet")

urlpatterns = [
    path(r'configs', include(router.urls)),
]

"""
user router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from order.views import OrderViewSet
router = DefaultRouter()
router.register(r'', OrderViewSet, basename="token")

urlpatterns = [
    path(r'users/', include(router.urls)),
]

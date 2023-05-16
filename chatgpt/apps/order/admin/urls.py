"""
user router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from order.admin.views import AdminPackageViewSet


router = DefaultRouter()
router.register(r'order-packages', AdminPackageViewSet, basename="AdminPackageViewSet")

urlpatterns = [
    path(r'order/', include(router.urls)),
]
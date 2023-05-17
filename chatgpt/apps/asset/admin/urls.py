"""
admin router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from asset.admin.views import AdminWithdrawAuditViewSet


router = DefaultRouter()
router.register(r'points-withdraw', AdminWithdrawAuditViewSet, basename="AdminWithdrawAuditViewSet")

urlpatterns = [
    path(r'asset/', include(router.urls)),
]
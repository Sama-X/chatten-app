"""
admin router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from asset.admin.views import (
    AdminPointsLogViewSet, AdminWithdrawAuditViewSet, AdminRechargeViewSet
)


router = DefaultRouter()
router.register(r'points-withdraw', AdminWithdrawAuditViewSet, basename="AdminWithdrawAuditViewSet")
router.register(r'points-log', AdminPointsLogViewSet, basename="AdminPointsLogViewSet")
router.register(r'recharge', AdminRechargeViewSet, basename="AdminRechargeViewSet")

urlpatterns = [
    path(r'asset/', include(router.urls)),
]

"""
asset router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter
from asset.views import PointsWithdrawViewSet


router = DefaultRouter()
router.register(r'points-withdraw', PointsWithdrawViewSet, basename="PointsWithdrawViewSet")

urlpatterns = [
    path(r'asset/', include(router.urls)),
]

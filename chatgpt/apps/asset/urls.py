"""
asset router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter
from asset.views import PointsLogViewset, PointsWithdrawViewSet


router = DefaultRouter()
router.register(r'points-withdraw', PointsWithdrawViewSet, basename="PointsWithdrawViewSet")
router.register(r'points-log', PointsLogViewset, basename="PointsLogViewset")

urlpatterns = [
    path(r'asset/', include(router.urls)),
]

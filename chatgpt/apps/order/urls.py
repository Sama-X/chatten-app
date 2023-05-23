"""
order api url
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter
from order.views import OrderPackageViewSet, OrderViewSet, WePayNotifyHandler


router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename="OrderViewSet")
router.register(r'order-packages', OrderPackageViewSet, basename="OrderPackageViewSet")
router.register(r'native_notify', WePayNotifyHandler, basename="WePayNotifyHandler")


urlpatterns = [
    path(r'order/', include(router.urls)),
]

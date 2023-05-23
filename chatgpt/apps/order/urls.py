from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter
from order.views import OrderPackageViewSet, OrderViewSet


router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename="OrderViewSet")
router.register(r'order-packages', OrderPackageViewSet, basename="OrderPackageViewSet")

urlpatterns = [
    path(r'order/', include(router.urls)),
]
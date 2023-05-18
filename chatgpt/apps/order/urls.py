"""
order admin router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from order.views import OrderViewset


router = DefaultRouter()
router.register(r'orders', OrderViewset, basename="OrderViewset")

urlpatterns = [
    path(r'order/', include(router.urls)),
]

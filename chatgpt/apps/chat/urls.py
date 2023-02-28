"""
user router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from chat.views import ChatViewset


router = DefaultRouter()
router.register(r'', ChatViewset, basename="ChatViewset")

urlpatterns = [
    path(r'chat/', include(router.urls)),
]

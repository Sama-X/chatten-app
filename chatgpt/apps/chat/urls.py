"""
user router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from chat.views import ChatViewset, ChatgptKeyViewSet


router = DefaultRouter()
router.register(r'chat', ChatViewset, basename="ChatViewset")
router.register(r'chatgpt', ChatgptKeyViewSet, basename="ChatgptKeyViewSet")

urlpatterns = [
    path(r'', include(router.urls)),
]

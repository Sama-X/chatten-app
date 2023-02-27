"""
user router module.
"""
from django.conf.urls import include
from django.urls import path
from rest_framework.routers import DefaultRouter

from users.views import LoginViewSet

router = DefaultRouter()
router.register(r'token', LoginViewSet, basename="token")

urlpatterns = [
    path(r'users/', include(router.urls)),
]

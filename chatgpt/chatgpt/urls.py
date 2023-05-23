"""chatgpt URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path, re_path

urlpatterns = [
    re_path(r'', include(('users.urls', 'users'), namespace="users")),
    re_path(r'', include(('chat.urls', 'chat'), namespace="chat")),
    re_path(r'', include(('asset.urls', 'asset'), namespace="asset")),
    re_path(r'', include(('order.urls', 'order'), namespace="order")),
    re_path(r'admin/', include(('order.admin.urls', 'order-admin'), namespace="order.admin")),
    re_path(r'admin/', include(('users.admin.urls', 'users-admin'), namespace="users.admin")),
    re_path(r'admin/', include(('asset.admin.urls', 'asset-admin'), namespace="asset.admin")),
]

# 增加统一v1 api
urlpatterns = [
    path(r'api/v1/', include(urlpatterns)),
]

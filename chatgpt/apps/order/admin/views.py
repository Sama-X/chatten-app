"""
order package admin api.
"""

from rest_framework import mixins, viewsets
from rest_framework.authentication import SessionAuthentication
from apps.order.service import OrderPackageService, OrderService

from base.serializer import BaseQuery
from order.admin.serializer import AdminOrderQuery



class AdminPackageViewSet(mixins.ListModelMixin, mixins.CreateModelMixin,
                          mixins.RetrieveModelMixin, mixins.DestroyModelMixin,
                          mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    order package manage api.
    """
    authentication_classes = ()

    def list(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/order/order-packages
        method: get
        desc: get order package list api
        """
        query = BaseQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or 'priority,id'  # type: ignore

        resp = OrderPackageService.get_list(page, offset, order)

        return resp

    def create(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/order/order-packages
        method: post
        desc: create order package api
        """
        return OrderPackageService.create_package(request)

    def retrieve(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/order/order-packages/<package_id>
        """
        package_id = kwargs.get('pk')
        return OrderPackageService.get_detail(package_id)

    def update(self, request, *args, **kwargs):
        package_id = kwargs['pk']
        return OrderPackageService.update(package_id, request)

    def destroy(self, request, *args, **kwargs):
        package_id = kwargs['pk']
        return OrderPackageService.delete(package_id)


class AdminOrderViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    order manage api.
    """
    authentication_classes = ()

    def list(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/order/orders/
        method: get
        desc: get order list api
        """
        query = AdminOrderQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or '-id'  # type: ignore
        user_id = query.validated_data.get('user_id')  # type: ignore
        package_id = query.validated_data.get('package_id')  # type: ignore
        order_number = query.validated_data.get('order_number')  # type: ignore
        status = query.validated_data.get('status')  # type: ignore

        resp = OrderService.get_list(page, offset, order, user_id, package_id, order_number, status)

        return resp

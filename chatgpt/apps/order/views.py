"""
order view.
"""

from rest_framework import mixins, viewsets

from base.middleware import AnonymousAuthentication
from order.serializer import OrderQuery
from order.service import OrderService


class OrderViewset(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    order api.
    """

    authentication_classes = [AnonymousAuthentication,]

    def list(self, request, *args, **kwargs):
        """
        url: /api/v1/order/orders/
        method: get
        desc: get order list api
        """
        query = OrderQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or 'status,-id'  # type: ignore
        user_id = request.user.id
        package_id = query.validated_data.get('package_id')  # type: ignore
        order_number = query.validated_data.get('order_number')  # type: ignore
        status = query.validated_data.get('status')  # type: ignore

        return OrderService.get_list(page, offset, order, user_id, package_id, order_number, status)

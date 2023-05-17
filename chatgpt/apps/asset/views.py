"""
asset api view.
"""

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from asset.serializer import WithdrawQuery
from asset.service import PointsService, PointsWithdrawService

from base.middleware import AnonymousAuthentication


class PointsWithdrawViewSet(mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    points withdraw api.
    """
    authentication_classes = (AnonymousAuthentication,)

    def list(self, request, *args, **kwargs):
        """
        url: /api/v1/asset/points-withdraw/
        method: get
        desc: get points withdraw list api
        """
        query = WithdrawQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or 'id'  # type: ignore
        status = query.validated_data.get('status') # type: ignore

        resp = PointsWithdrawService.get_list(request.user.id, page, offset, order, status)

        return resp

    def create(self, request, *args, **kwargs):
        """
        url: /api/v1/asset/points-withdraw/
        method: post
        desc: Apply for cash withdrawal
        """
        return PointsService.withdraw_point(request.user.id, request)

    @action(methods=['POST'], detail=False)
    def exchange(self, request, *args, **kwargs):
        """
        url: /api/v1/asset/points-withdraw/exchange/
        method: post
        desc: Points exchange asset
        """
        return PointsService.exchange_point(request.user.id, request)

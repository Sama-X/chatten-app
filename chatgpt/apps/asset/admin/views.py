"""
admin api.
"""

from rest_framework import mixins, viewsets
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from asset.admin.serializer import AdminWithdrawQuery
from asset.models import PointsWithdrawModel
from asset.service import PointsWithdrawService

from base.serializer import BaseQuery



class AdminWithdrawAuditViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    withdraw manage api.
    """
    authentication_classes = ()

    def list(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/asset/points-withdraw/pending/
        method: get
        desc: get withdraw list api
        """
        query = AdminWithdrawQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or '-id'  # type: ignore
        status = query.validated_data.get('status') # type: ignore

        resp = PointsWithdrawService.get_list(None, page, offset, order, status)

        return resp

    @action(methods=['GET'], detail=False)
    def pending(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/asset/points-withdraw/pending/
        method: get
        desc: get withdraw pending review api
        """
        query = BaseQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or 'id'  # type: ignore

        resp = PointsWithdrawService.get_list(None, page, offset, order, PointsWithdrawModel.STATUS_PENDING)

        return resp

    @action(methods=['PUT'], detail=True)
    def audit(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/asset/points-withdraw/<withdraw_id>/audit/
        method: PUT
        params: {
            "success": true
        }
        desc: withdraw pending review audit api
        """
        withdraw_id = kwargs["pk"]
        return PointsWithdrawService.audit(withdraw_id, request)

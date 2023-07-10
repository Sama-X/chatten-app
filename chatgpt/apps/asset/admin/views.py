"""
admin api.
"""
from re import A
from django.utils.translation import gettext as _

from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from asset.admin.serializer import AdminWithdrawQuery, PointsLogQuery, RechargeSerializer
from asset.models import PointsWithdrawModel
from asset.service import O2OPaymentService, PointsLogService, PointsWithdrawService
from base.exception import SystemErrorCode
from base.middleware import AdminAuthentication
from base.response import APIResponse, SerializerErrorResponse

from base.serializer import BaseQuery
from users.models import AccountModel



class AdminWithdrawAuditViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    withdraw manage api.
    """
    authentication_classes = (AdminAuthentication,)

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


class AdminPointsLogViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    points log api.
    """

    authentication_classes = (AdminAuthentication,)

    def list(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/asset/points-log/
        method: get
        desc: get points withdraw list api
        """
        query = PointsLogQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or '-id'  # type: ignore
        user_id = query.validated_data.get('user_id')  # type: ignore

        resp = PointsLogService.get_list(user_id, page, offset, order)

        return resp


class AdminRechargeViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    recharge manage api.
    """
    authentication_classes = (AdminAuthentication,)

    def create(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/asset/recharge/
        method: post
        params: {
            "mobiles": 1,
            "times": 100
        }
        desc: create recharge api
        """
        form = RechargeSerializer(data=request.data)
        if not form.is_valid():
            return SerializerErrorResponse(form, code=SystemErrorCode.PARAMS_INVALID)

        mobiles = form.validated_data.get('mobiles', []) # type: ignore
        times = form.validated_data.get('times') # type: ignore

        users = AccountModel.objects.filter(username__in=mobiles).all()
        new_mobiles = set(mobiles)
        old_mobiles = set([user.username for user in users])
        sub_mobiles = new_mobiles - old_mobiles
        for user in users:
            O2OPaymentService.add_payment_by_reward(user.id, times, _("inner recharge"))

        return APIResponse(result={
            "success": True,
            "sub_mobiles": sub_mobiles
        })

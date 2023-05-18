"""
order package admin api.
"""

from rest_framework import mixins, viewsets
from apps.order.service import OrderPackageService

from base.serializer import BaseQuery
from users.admin.serializer import ReportQuery
from users.service import ConfigService, ReportService



class ConfigViewSet(mixins.ListModelMixin, mixins.DestroyModelMixin,
                    mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    config manage api.
    """
    authentication_classes = ()

    def list(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/configs
        method: get
        desc: get config items list api
        """
        query = BaseQuery(data=request.GET)
        query.is_valid()

        page = query.validated_data.get('page') or 1  # type: ignore
        offset = query.validated_data.get('offset') or 20  # type: ignore
        order = query.validated_data.get('order') or 'id'  # type: ignore

        resp = ConfigService.get_list(page, offset, order)

        return resp

    def update(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/configs/<config_id>/
        method: put
        desc: update config item api
        """
        package_id = kwargs['pk']
        return ConfigService.update(package_id, request)

    def destroy(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/configs/<config_id>
        method: delete
        desc: delete config item api
        """
        package_id = kwargs['pk']
        return ConfigService.delete(package_id)


class AdminSummaryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    admin summary api.
    """

    authentication_classes = ()

    def list(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/summary
        method: get
        desc: get summary api
        """
        query = ReportQuery(data=request.GET)
        query.is_valid()
        start_date = query.validated_data.get('start_date') # type: ignore
        end_date = query.validated_data.get('end_date') # type: ignore

        return ReportService.get_summary(start_date, end_date)

"""
order package admin api.
"""

from rest_framework import mixins, viewsets
from apps.order.service import OrderPackageService

from base.serializer import BaseQuery
from users.service import ConfigService



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

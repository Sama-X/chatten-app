"""
order package admin api.
"""

from datetime import datetime
from rest_framework import mixins, viewsets
from rest_framework.decorators import action

from django.contrib.auth.models import User
from base.common import CommonUtil

from base.exception import SystemErrorCode, UserErrorCode
from base.middleware import AdminAuthentication
from base.response import APIResponse, SerializerErrorResponse

from base.serializer import BaseQuery
from users.admin.serializer import AdminLoginSerializer, ReportQuery
from users.service import ConfigService, ReportService



class ConfigViewSet(mixins.ListModelMixin, mixins.DestroyModelMixin,
                    mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """
    config manage api.
    """
    authentication_classes = (AdminAuthentication,)

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

    authentication_classes = (AdminAuthentication,)

    def list(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/summary
        method: get
        desc: get summary api
        """
        return ReportService.get_summary()

    @action(methods=['GET'], detail=False)
    def daily(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/summary/daily/
        method: get
        desc: get summary by day api
        """
        query = ReportQuery(data=request.GET)
        query.is_valid()
        start_date = query.validated_data.get('start_date') # type: ignore
        end_date = query.validated_data.get('end_date') # type: ignore

        return ReportService.get_summary_by_day(start_date, end_date)

class AdminLoginViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """
    admin login api.
    """

    authentication_classes = []
    serializer_class = ()
    queryset = None

    def create(self, request, *args, **kwargs):
        """
        url: /api/v1/admin/token/
        """
        form = AdminLoginSerializer(data=request.data)
        if not form.is_valid():
            return SerializerErrorResponse(form, SystemErrorCode.HTTP_400_BAD_REQUEST)

        username = form.validated_data.get('username')  # type: ignore
        password = form.validated_data.get('password')  # type: ignore

        if not password:
            return APIResponse(code=UserErrorCode.USER_OAUTH_REQUIRED)

        return self._handle_password_login(request, username, password)

    def _handle_password_login(self, request, username, password):
        """
        handle password login function.
        """
        user = User.objects.filter(username=username).first()
        if not user or not user.check_password(password):
            return APIResponse(code=UserErrorCode.USER_INVALID_PASSWORD)

        user.last_login = datetime.now()
        user.save()

        user_id = user.id  # type: ignore
        token = CommonUtil.generate_admin_user_token(user_id)

        return APIResponse(result={
            'id': user_id,
            'nickname': user.username,
            'token': token
        })

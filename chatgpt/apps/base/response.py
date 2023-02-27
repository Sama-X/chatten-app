"""
custom response module.
"""
from django.utils.translation import gettext as _
from rest_framework.response import Response

from base.exception import ALL_ERROR_DICT


class APIResponse(Response):
    """
    api response.
    """

    def __init__(self, code=0, msg='', result=None, count=None, headers=None,
                 exception=False,
                 **kwargs):
        data = {
            'code': code,
            'msg': _(msg if msg else ALL_ERROR_DICT.get(code, '')),
        }
        if result is not None:
            data['data'] = result
        if count is not None:
            data["count"] = count

        data.update(kwargs)
        super().__init__(data=data, headers=headers, exception=exception)

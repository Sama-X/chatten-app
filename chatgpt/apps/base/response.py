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


class SerializerErrorResponse(Response):
    """
    serializer error response.
    """

    def __init__(self, serializer, code=None):
        data = {
            'code': code or 0
        }
        msgs = []
        for key in serializer.errors:
            values = [str(val) for val in serializer.errors[key]]
            msg = '.'.join(values)
            key_name = serializer.fields[key].help_text or key
            msgs.append(f'{key_name}: {msg}')

        data['msg'] = ';'.join(msgs)

        super().__init__(data=data)

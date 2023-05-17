"""
base service module.
"""

class BaseService:
    """
    base service.
    """
    @classmethod
    def check_order_fields(cls, clz, fields):
        """
        check order field.
        """
        new_fields = []
        for field in fields:
            new_field = field.replace('-', '')
            if hasattr(clz, new_field):
                new_fields.append(field)

        return new_fields

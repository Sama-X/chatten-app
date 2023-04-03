"""
Base model.
"""
from datetime import datetime
from django.db import models


class BaseModel(models.Model):
    """
    Base model.
    """
    id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')
    add_time = models.DateTimeField(verbose_name="create_time", default=datetime.now, db_index=True)
    modified_time = models.DateTimeField(verbose_name="modified_time", auto_now=True, db_index=True)
    is_delete = models.BooleanField(default=False, db_index=True)

    class Meta:
        """ Meta """
        abstract = True

    def __str__(self):
        """ string """
        return str(self.id)

"""
order admin serializer.
"""
from django.utils.translation import gettext as _

from rest_framework import serializers

from order.models import OrderPackageModel


class OrderPackageSerializer(serializers.ModelSerializer):
    """
    order package serializer.
    """

    category_name = serializers.SerializerMethodField()
    add_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore

    def get_category_name(self, obj):
        """
        get category name.
        """
        return OrderPackageModel.CATEGORIES_DICT.get(obj.category)

    class Meta:
        """
        meta class.
        """
        model = OrderPackageModel
        fields = (
            'id', 'name', 'category', 'category_name', 'usage_days', 'usage_count',
            'price', 'priority', 'add_time'
        )


class CreateOrderPackageSerializer(serializers.Serializer):
    """
    create order package.
    """

    name = serializers.CharField(
        max_length=32, required=True, allow_blank=False, allow_null=False, help_text=_("order package name")
    )
    category = serializers.IntegerField(
        required=True, allow_null=False, help_text=_("order package category")
    )
    usage_days = serializers.IntegerField(
        required=True, min_value=0, allow_null=False, help_text=_("order package usage days")
    )
    usage_count = serializers.IntegerField(
        required=True, min_value=1, allow_null=False, help_text=_("order package usage times")
    )
    price = serializers.FloatField(
        required=True, allow_null=False, min_value=0, help_text=_("order package prices")
    )
    priority = serializers.IntegerField(
        required=False, default=0, allow_null=True, help_text=_("order pageck sort priority")
    )


class UpdateOrderPackageSerializer(CreateOrderPackageSerializer):
    """
    update order package.
    """

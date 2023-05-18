"""
order admin serializer.
"""
from django.utils.translation import gettext as _

from rest_framework import serializers
from base.serializer import BaseQuery

from order.models import OrderModel, OrderPackageModel


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
        required=False, default=0, allow_null=True, help_text=_("order package sort priority")
    )


class UpdateOrderPackageSerializer(CreateOrderPackageSerializer):
    """
    update order package.
    """


class AdminOrderQuery(BaseQuery):
    """
    admin order query params.
    """
    user_id = serializers.IntegerField(
        required=False, allow_null=True, help_text=_("order user id")
    )
    package_id = serializers.IntegerField(
        required=False, allow_null=True, help_text=_("order package id")
    )
    order_number = serializers.CharField(
        required=False, allow_null=True, help_text=_("order number")
    )
    status = serializers.IntegerField(
        required=False, allow_null=True, help_text=_("order status")
    )


class OrderSerializer(serializers.ModelSerializer):
    """
    order serializer.
    """

    status_name = serializers.SerializerMethodField()
    payment_method_name = serializers.SerializerMethodField()
    add_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore
    payment_time = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S") # type: ignore
    user_name = serializers.SerializerMethodField()
    package_name = serializers.SerializerMethodField()

    def get_payment_method_name(self, obj):
        """
        get payment method.
        """
        return OrderModel.METHODS_DICT.get(obj.payment_method)

    def get_status_name(self, obj):
        """
        get status name.
        """
        return OrderModel.STATUS_DICT.get(obj.status)

    def get_user_name(self, obj):
        """
        get user name.
        """
        user = self.context.get('user_dict', {}).get(obj.user_id)
        if not user:
            return None

        return user.nickname or user.username

    def get_package_name(self, obj):
        """
        get order package name.
        """
        package = self.context.get('order_package_dict', {}).get(obj.package_id)
        return package.name if package else None

    class Meta:
        """
        meta class.
        """
        model = OrderModel
        fields = (
            'id', 'user_id', 'package_id', 'order_number', 'quantity', 'actual_price',
            'status', 'status_name', 'status_note', 'payment_time', 'payment_method',
            'payment_method_name'
        )

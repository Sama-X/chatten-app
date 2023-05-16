# Generated by Django 4.1.7 on 2023-05-16 14:57
# flake8: noqa
# pylint: skip-file
import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='OrderModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('add_time', models.DateTimeField(db_index=True, default=datetime.datetime.now, verbose_name='create_time')),
                ('modified_time', models.DateTimeField(auto_now=True, db_index=True, verbose_name='modified_time')),
                ('is_delete', models.BooleanField(db_index=True, default=False)),
                ('user_id', models.BigIntegerField(db_index=True, verbose_name='user account id')),
                ('package_id', models.BigIntegerField(db_index=True, verbose_name='order package id')),
                ('order_number', models.CharField(db_index=True, max_length=64, verbose_name='order number')),
                ('quantity', models.IntegerField(default=1, verbose_name='order quantity')),
                ('actual_price', models.FloatField(default=0, verbose_name='order actual price')),
                ('status', models.SmallIntegerField(db_index=True, default=0, verbose_name='order status')),
                ('status_note', models.CharField(max_length=64, verbose_name='order status note')),
                ('payment_time', models.DateTimeField(verbose_name='order payment time')),
                ('payment_method', models.SmallIntegerField(default=1, verbose_name='order pay method')),
            ],
            options={
                'verbose_name': 'OrderModel',
                'verbose_name_plural': 'OrderModel',
                'db_table': 'order',
            },
        ),
        migrations.CreateModel(
            name='OrderPackageModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('add_time', models.DateTimeField(db_index=True, default=datetime.datetime.now, verbose_name='create_time')),
                ('modified_time', models.DateTimeField(auto_now=True, db_index=True, verbose_name='modified_time')),
                ('is_delete', models.BooleanField(db_index=True, default=False)),
                ('name', models.CharField(db_index=True, max_length=32, verbose_name='package name')),
                ('category', models.SmallIntegerField(default=0, verbose_name='package category')),
                ('usage_days', models.SmallIntegerField(default=0, verbose_name='package usage days')),
                ('usage_count', models.IntegerField(default=0, verbose_name='package usage count')),
                ('price', models.FloatField(default=0.0, verbose_name='package price')),
                ('priority', models.IntegerField(db_index=True, default=1, verbose_name='package sort priority')),
            ],
            options={
                'verbose_name': 'OrderPackageModel',
                'verbose_name_plural': 'OrderPackageModel',
                'db_table': 'order_package',
            },
        ),
    ]

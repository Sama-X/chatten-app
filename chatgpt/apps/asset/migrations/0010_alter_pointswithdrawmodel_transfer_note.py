# Generated by Django 4.1.7 on 2023-05-30 17:15
# flake8: noqa
# pylint: skip-file
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('asset', '0009_pointswithdrawmodel_transfer_note'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pointswithdrawmodel',
            name='transfer_note',
            field=models.TextField(null=True, verbose_name='转账备注'),
        ),
    ]
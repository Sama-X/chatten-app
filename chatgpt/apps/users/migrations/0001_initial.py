# Generated by Django 4.1.7 on 2023-02-28 03:26
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
            name='AccountModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('add_time', models.DateTimeField(db_index=True, default=datetime.datetime.now, verbose_name='create_time')),
                ('modified_time', models.DateTimeField(auto_now=True, db_index=True, verbose_name='modified_time')),
                ('is_delete', models.BooleanField(db_index=True, default=False)),
                ('mobile', models.CharField(max_length=16, unique=True, verbose_name='db:account:user mobile')),
                ('password', models.CharField(max_length=512, null=True, verbose_name='db:account:user password')),
                ('nickname', models.CharField(max_length=32, null=True, verbose_name='db:account:user nickname')),
                ('avatar', models.CharField(max_length=128, null=True, verbose_name='db:account:user avatar')),
                ('experience', models.SmallIntegerField(default=10, verbose_name='db:account:user experience time')),
                ('is_vip', models.BooleanField(default=False, verbose_name='db:account:user is vip')),
                ('login_time', models.DateTimeField(null=True, verbose_name='db:account:user last login time')),
                ('login_ip', models.CharField(max_length=32, null=True, verbose_name='db:account:user last login ip')),
            ],
            options={
                'verbose_name': 'db:account:Account',
                'verbose_name_plural': 'db:account:Account',
                'db_table': 'account',
            },
        ),
        migrations.CreateModel(
            name='MessageLogModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('add_time', models.DateTimeField(db_index=True, default=datetime.datetime.now, verbose_name='create_time')),
                ('modified_time', models.DateTimeField(auto_now=True, db_index=True, verbose_name='modified_time')),
                ('is_delete', models.BooleanField(db_index=True, default=False)),
                ('mobile', models.CharField(db_index=True, max_length=16, verbose_name='db:MessageLog:message mobile')),
                ('content', models.TextField(verbose_name='db:MessageLog:message content')),
                ('category', models.SmallIntegerField(default=0, verbose_name='db:MessageLog:message category')),
                ('response', models.TextField(verbose_name='db:MessageLog: send message response')),
                ('success', models.BooleanField(default=False, verbose_name='db:MessageLog: message send status')),
                ('request_time', models.DateTimeField(verbose_name='db:MessageLog: request time')),
                ('response_time', models.DateTimeField(verbose_name='db:MessageLog: response time')),
            ],
            options={
                'verbose_name': 'db:account:MessageLog',
                'verbose_name_plural': 'db:account:MessageLog',
                'db_table': 'message_log',
            },
        ),
    ]
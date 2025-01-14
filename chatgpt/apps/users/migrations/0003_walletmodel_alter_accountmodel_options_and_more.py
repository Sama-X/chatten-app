# Generated by Django 4.1.7 on 2023-03-02 06:35
# flake8: noqa
# pylint: skip-file
import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_alter_messagelogmodel_response_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='WalletModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('add_time', models.DateTimeField(db_index=True, default=datetime.datetime.now, verbose_name='create_time')),
                ('modified_time', models.DateTimeField(auto_now=True, db_index=True, verbose_name='modified_time')),
                ('is_delete', models.BooleanField(db_index=True, default=False)),
                ('user_id', models.BigIntegerField(db_index=True, verbose_name='user id')),
                ('category', models.CharField(db_index=True, max_length=32, verbose_name='wallet category')),
                ('address', models.CharField(db_index=True, max_length=64, verbose_name='wallet address')),
                ('private_key', models.CharField(max_length=512, verbose_name='wallet private key')),
            ],
            options={
                'verbose_name': 'Wallet',
                'verbose_name_plural': 'Wallet',
                'db_table': 'wallet',
            },
        ),
        migrations.AlterModelOptions(
            name='accountmodel',
            options={'verbose_name': 'Account', 'verbose_name_plural': 'Account'},
        ),
        migrations.AlterModelOptions(
            name='messagelogmodel',
            options={'verbose_name': 'message log', 'verbose_name_plural': 'message log'},
        ),
        migrations.RemoveField(
            model_name='accountmodel',
            name='password',
        ),
        migrations.AddField(
            model_name='accountmodel',
            name='_password_hash',
            field=models.CharField(max_length=512, null=True, verbose_name='user password'),
        ),
        migrations.AddField(
            model_name='accountmodel',
            name='username',
            field=models.CharField(default=None, max_length=32, unique=True, verbose_name='username'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='accountmodel',
            name='avatar',
            field=models.CharField(max_length=128, null=True, verbose_name='user avatar'),
        ),
        migrations.AlterField(
            model_name='accountmodel',
            name='experience',
            field=models.SmallIntegerField(default=10, verbose_name='user experience time'),
        ),
        migrations.AlterField(
            model_name='accountmodel',
            name='is_vip',
            field=models.BooleanField(default=False, verbose_name='user is vip'),
        ),
        migrations.AlterField(
            model_name='accountmodel',
            name='login_ip',
            field=models.CharField(max_length=32, null=True, verbose_name='user last login ip'),
        ),
        migrations.AlterField(
            model_name='accountmodel',
            name='login_time',
            field=models.DateTimeField(null=True, verbose_name='user last login time'),
        ),
        migrations.AlterField(
            model_name='accountmodel',
            name='mobile',
            field=models.CharField(max_length=16, null=True, verbose_name='user mobile'),
        ),
        migrations.AlterField(
            model_name='accountmodel',
            name='nickname',
            field=models.CharField(max_length=32, null=True, verbose_name='user nickname'),
        ),
        migrations.AlterField(
            model_name='messagelogmodel',
            name='category',
            field=models.SmallIntegerField(default=0, verbose_name='message category'),
        ),
        migrations.AlterField(
            model_name='messagelogmodel',
            name='content',
            field=models.TextField(verbose_name='message content'),
        ),
        migrations.AlterField(
            model_name='messagelogmodel',
            name='mobile',
            field=models.CharField(db_index=True, max_length=16, verbose_name='message mobile'),
        ),
        migrations.AlterField(
            model_name='messagelogmodel',
            name='request_time',
            field=models.DateTimeField(verbose_name='request time'),
        ),
        migrations.AlterField(
            model_name='messagelogmodel',
            name='response',
            field=models.TextField(null=True, verbose_name='send message response'),
        ),
        migrations.AlterField(
            model_name='messagelogmodel',
            name='response_time',
            field=models.DateTimeField(null=True, verbose_name='response time'),
        ),
        migrations.AlterField(
            model_name='messagelogmodel',
            name='success',
            field=models.BooleanField(default=False, verbose_name='message send status'),
        ),
    ]

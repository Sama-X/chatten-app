# Generated by Django 4.1.7 on 2023-03-23 15:42
# flake8: noqa
# pylint: skip-file
import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0004_chatrecordmodel_prompt_tokens_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ChatgptKeyModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('add_time', models.DateTimeField(db_index=True, default=datetime.datetime.now, verbose_name='create_time')),
                ('modified_time', models.DateTimeField(auto_now=True, db_index=True, verbose_name='modified_time')),
                ('is_delete', models.BooleanField(db_index=True, default=False)),
                ('user_id', models.BigIntegerField(db_index=True, verbose_name='user foreign key')),
                ('key', models.CharField(max_length=128, verbose_name='chatgpt private key')),
            ],
            options={
                'verbose_name': 'chatgpt table',
                'verbose_name_plural': 'chatgpt table',
                'db_table': 'chatgpt_key',
            },
        ),
        migrations.AddField(
            model_name='chatrecordmodel',
            name='chatgpt_key_id',
            field=models.BigIntegerField(db_index=True, default=None, verbose_name='chatgpt key foreign key'),
            preserve_default=False,
        ),
    ]

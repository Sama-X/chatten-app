# Generated by Django 4.1.7 on 2023-05-23 15:59
# flake8: noqa
# pylint: skip-file
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0008_chattopicmodel_chatrecordmodel_chat_topic_id'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='chatgptkeymodel',
            options={'verbose_name': 'chatgpt密钥表', 'verbose_name_plural': 'chatgpt密钥表'},
        ),
        migrations.AlterModelOptions(
            name='chatrecordmodel',
            options={'verbose_name': '聊天记录', 'verbose_name_plural': '聊天记录'},
        ),
        migrations.AlterField(
            model_name='chatgptkeymodel',
            name='enable',
            field=models.BooleanField(default=True, verbose_name='启用'),
        ),
        migrations.AlterField(
            model_name='chatgptkeymodel',
            name='key',
            field=models.CharField(max_length=128, unique=True, verbose_name='chatgpt键'),
        ),
        migrations.AlterField(
            model_name='chatgptkeymodel',
            name='user_id',
            field=models.BigIntegerField(db_index=True, verbose_name='用户id'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='approval',
            field=models.IntegerField(default=0, verbose_name='点赞数'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='chat_topic_id',
            field=models.BigIntegerField(db_index=True, null=True, verbose_name='聊天话题id'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='chatgpt_key_id',
            field=models.BigIntegerField(db_index=True, null=True, verbose_name='chatgpt外键'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='msg_type',
            field=models.SmallIntegerField(db_index=True, default=1, verbose_name='消息类型'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='prompt_tokens',
            field=models.IntegerField(default=0, verbose_name='提问token消耗'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='question',
            field=models.TextField(verbose_name='问题'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='question_time',
            field=models.DateTimeField(verbose_name='提问时间'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='resp_tokens',
            field=models.IntegerField(default=0, verbose_name='回答token消耗'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='response',
            field=models.TextField(null=True, verbose_name='gpt响应数据'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='response_time',
            field=models.DateTimeField(null=True, verbose_name='响应时间'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='success',
            field=models.BooleanField(default=False, verbose_name='是否响应'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='total_tokens',
            field=models.IntegerField(default=0, verbose_name='总token消耗'),
        ),
        migrations.AlterField(
            model_name='chatrecordmodel',
            name='user_id',
            field=models.BigIntegerField(db_index=True, verbose_name='用户id'),
        ),
        migrations.AlterField(
            model_name='chattopicmodel',
            name='title',
            field=models.CharField(max_length=128, verbose_name='聊天话题'),
        ),
        migrations.AlterField(
            model_name='chattopicmodel',
            name='user_id',
            field=models.BigIntegerField(db_index=True, verbose_name='用户id'),
        ),
    ]

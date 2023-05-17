# Generated by Django 4.1.7 on 2023-05-17 11:59
# flake8: noqa
# pylint: skip-file
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_configmodel'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='ScoreLogModel',
            new_name='SamaScoreLogModel',
        ),
        migrations.RenameModel(
            old_name='ScoreModel',
            new_name='SamaScoreModel',
        ),
        migrations.RenameModel(
            old_name='WalletModel',
            new_name='SamaWalletModel',
        ),
        migrations.AlterModelOptions(
            name='samascorelogmodel',
            options={'verbose_name': 'SamaScoreLog', 'verbose_name_plural': 'SamaScoreLog'},
        ),
        migrations.AlterModelOptions(
            name='samascoremodel',
            options={'verbose_name': 'SamaScore', 'verbose_name_plural': 'SamaScore'},
        ),
        migrations.AlterModelOptions(
            name='samawalletmodel',
            options={'verbose_name': 'SamaWallet', 'verbose_name_plural': 'SamaWallet'},
        ),
        migrations.AlterModelTable(
            name='samascorelogmodel',
            table='sama_account_score_log',
        ),
        migrations.AlterModelTable(
            name='samascoremodel',
            table='sama_account_score',
        ),
        migrations.AlterModelTable(
            name='samawalletmodel',
            table='sama_wallet',
        ),
    ]
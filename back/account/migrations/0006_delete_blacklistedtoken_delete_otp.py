# Generated by Django 5.0.6 on 2024-09-25 13:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0005_remove_otp_code_otp_secret'),
    ]

    operations = [
        migrations.DeleteModel(
            name='BlackListedToken',
        ),
        migrations.DeleteModel(
            name='OTP',
        ),
    ]
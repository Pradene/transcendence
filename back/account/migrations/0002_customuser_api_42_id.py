# Generated by Django 5.0.6 on 2024-09-16 22:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('account', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='api_42_id',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True),
        ),
    ]
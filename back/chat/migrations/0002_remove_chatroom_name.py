# Generated by Django 5.0.6 on 2024-09-28 15:57

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='chatroom',
            name='name',
        ),
    ]

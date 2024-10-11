# Generated by Django 5.0.6 on 2024-10-11 12:01

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('game', '__first__'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ChatRoom',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('picture', models.ImageField(blank=True, default='room_pictures/default.png', null=True, upload_to='room_pictures/')),
                ('is_private', models.BooleanField(default=True)),
                ('users', models.ManyToManyField(related_name='rooms', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Invitation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('declined', 'Declined'), ('canceled', 'Canceled'), ('finished', 'Finished')], default='pending')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('game', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='game.game')),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitations', to='chat.chatroom')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invitations', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='chat.chatroom')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]

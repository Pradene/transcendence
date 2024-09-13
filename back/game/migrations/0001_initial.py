# Generated by Django 5.0.6 on 2024-09-13 14:12

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='GameModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user1_score', models.IntegerField()),
                ('user2_score', models.IntegerField()),
                ('user1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user1', to=settings.AUTH_USER_MODEL)),
                ('user2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user2', to=settings.AUTH_USER_MODEL)),
                ('winner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game_winner', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='TournamentModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('game1', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game1', to='game.gamemodel')),
                ('game2', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game2', to='game.gamemodel')),
                ('game3', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='game3', to='game.gamemodel')),
                ('winner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tournament_winner', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]

# Generated by Django 3.1.3 on 2020-12-14 20:45

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('retro_app', '0010_retro_votes'),
    ]

    operations = [
        migrations.AddField(
            model_name='list',
            name='votes',
            field=models.ManyToManyField(related_name='card_votes', to=settings.AUTH_USER_MODEL),
        ),
    ]

# Generated by Django 3.1.3 on 2020-12-14 20:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('retro_app', '0009_retro_voting'),
    ]

    operations = [
        migrations.AddField(
            model_name='retro',
            name='votes',
            field=models.PositiveSmallIntegerField(default=1),
        ),
    ]

# Generated by Django 3.1.3 on 2020-11-24 19:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('retro_app', '0005_retro'),
    ]

    operations = [
        migrations.AddField(
            model_name='list',
            name='retro',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='retro_app.retro'),
            preserve_default=False,
        ),
    ]

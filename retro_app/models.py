from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.


class Retro(models.Model):
    name = models.CharField(max_length=64)
    leader = models.CharField(max_length=32)
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    voting = models.BooleanField(default=False)
    votes = models.PositiveSmallIntegerField(default=1)

    def __str__(self):
        return self.name + " (" + self.author.username + ")"


class List(models.Model):
    item = models.CharField(max_length=200)
    completed = models.PositiveSmallIntegerField(default=1)
    retro = models.ForeignKey(Retro, on_delete=models.CASCADE)
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    votes = models.ManyToManyField(get_user_model(), related_name='card_votes')

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return self.item + ' | ' + str(self.completed)

    def get_votes(self):
        return self.votes.count()



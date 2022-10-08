from django.db import models
from django.contrib.auth import get_user_model


class Retro(models.Model):
    name = models.CharField(max_length=64)
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    voting = models.BooleanField(default=False)
    votes = models.PositiveSmallIntegerField(default=1)
    archived = models.BooleanField(default=False)

    def __str__(self):
        return self.name + " (" + self.author.username + ")"


class Card(models.Model):
    body = models.TextField(blank=False)
    category = models.PositiveSmallIntegerField(default=1)
    retro = models.ForeignKey(Retro, on_delete=models.CASCADE, related_name='cards')
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    votes = models.ManyToManyField(get_user_model(), blank=True, related_name='card_votes')
    is_merged = models.BooleanField(default=False)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return self.body + ' | ' + str(self.category)

    def get_votes(self):
        return self.votes.count()



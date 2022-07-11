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


class List(models.Model):
    item = models.CharField(max_length=200)
    category = models.PositiveSmallIntegerField(default=1)
    retro = models.ForeignKey(Retro, on_delete=models.CASCADE)  # spróbować related_name np. cards
    author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    votes = models.ManyToManyField(get_user_model(), related_name='card_votes')

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return self.item + ' | ' + str(self.category)

    def get_votes(self):
        return self.votes.count()



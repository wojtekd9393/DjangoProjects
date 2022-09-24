from django import forms
from .models import Card, Retro


class CardForm(forms.ModelForm):
    class Meta:
        model = Card
        fields = ['body', 'category']


class RetroForm(forms.ModelForm):
    class Meta:
        model = Retro
        fields = ['name']

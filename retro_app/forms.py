from django import forms
from .models import List, Retro
from django.contrib.auth.forms import UserCreationForm


class ListForm(forms.ModelForm):
    class Meta:
        model = List
        fields = ['item', 'completed', 'retro', 'author']


class RetroForm(forms.ModelForm):
    class Meta:
        model = Retro
        fields = ['name', 'leader', 'author']

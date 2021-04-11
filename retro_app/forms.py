from django import forms
from .models import List, Retro


class ListForm(forms.ModelForm):
    class Meta:
        model = List
        fields = ['item', 'category', 'retro', 'author']


class RetroForm(forms.ModelForm):
    class Meta:
        model = Retro
        fields = ['name', 'author']

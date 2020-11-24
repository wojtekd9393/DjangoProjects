from django import forms
from .models import List, Retro


class ListForm(forms.ModelForm):
    class Meta:
        model = List
        fields = ['item', 'completed', 'retro']


class RetroForm(forms.ModelForm):
    class Meta:
        model = Retro
        fields = ['name', 'leader']

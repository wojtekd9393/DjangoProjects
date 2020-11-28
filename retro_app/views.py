from django.shortcuts import render, redirect
from .models import List, Retro
from .forms import ListForm, RetroForm
from django.contrib import messages
from django.urls import reverse
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login

# Create your views here.


def home(request, retro_id):
    if request.method == 'POST':
        form = ListForm(request.POST or None)

        if form.is_valid():
            form.save()
            all_items = List.objects.filter(retro=retro_id)
            messages.success(request, ('Item has been added to List!'))
            return render(request, 'home.html', {'all_items': all_items, 'retro_id': retro_id})
    else:
        all_items = List.objects.filter(retro=retro_id)
        return render(request, 'home.html', {'all_items': all_items, 'retro_id': retro_id})


def delete(request, list_id):
    item = List.objects.get(pk=list_id)
    item.delete()
    messages.success(request, ('Item has been deleted!'))
    return redirect('home', retro_id=item.retro.id)


def edit(request, list_id):
    if request.method == 'POST':
        item = List.objects.get(pk=list_id)

        form = ListForm(request.POST or None, instance=item)

        if form.is_valid():
            form.save()
            messages.success(request, ('Item has been edited!'))
            return redirect('home', retro_id=item.retro.id)
    else:
        item = List.objects.get(pk=list_id)
        return render(request, 'edit.html', {'item': item})


def main(request):
    if request.method == 'POST':
        form = RetroForm(request.POST or None)

        if form.is_valid():
            form.save()
            all_retros = Retro.objects.all()
            retros_with_amount_of_cards = []
            for retro in all_retros:
                retros_with_amount_of_cards.append([retro, retro.list_set.count()])
            return render(request, 'main.html', {'all_retros': all_retros, 'all_items': retros_with_amount_of_cards})
    else:
        all_retros = Retro.objects.all()
        retros_with_amount_of_cards = []
        for retro in all_retros:
            retros_with_amount_of_cards.append([retro, retro.list_set.count()])
        return render(request, 'main.html', {'all_retros': all_retros, 'all_items': retros_with_amount_of_cards})


def go_to_main(request):
    return redirect('main')


def remove_retro(request, retro_id):
    item = Retro.objects.get(pk=retro_id)
    item.delete()
    return redirect('main')


def dashboard(request):
    return render(request, 'dashboard.html')


def register(request):
    if request.method == "GET":
        return render(
            request, "register.html", {"form": UserCreationForm}
        )
    elif request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(reverse("dashboard"))


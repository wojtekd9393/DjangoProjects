from django.shortcuts import render, redirect
from .models import List, Retro
from .forms import ListForm, RetroForm
# from django.contrib import messages
from django.urls import reverse
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required

from django.http import JsonResponse
from django.forms.models import model_to_dict

# Create your views here.


def home(request, retro_id):
    if request.method == 'POST':
        form = ListForm(request.POST or None)

        if form.is_valid():
            new_task = form.save()
            # all_items = List.objects.filter(retro=retro_id)
            return JsonResponse({'task': model_to_dict(new_task), 'retro_id': retro_id}, status=200)
    else:
        retro = Retro.objects.get(pk=retro_id)
        author = retro.author
        all_items = List.objects.filter(retro=retro_id)
        return render(request, 'home.html', {'all_items': all_items, 'retro_id': retro_id, 'author': author})


def delete(request, list_id):
    item = List.objects.get(pk=list_id)
    item.delete()
    # messages.success(request, ('Item has been deleted!'))
    # return redirect('home', retro_id=item.retro.id)
    return JsonResponse({'result': 'ok'}, status=200)


def edit(request, list_id):
    if request.method == 'POST':
        item = List.objects.get(pk=list_id)

        form = ListForm(request.POST or None, instance=item)

        if form.is_valid():
            form.save()
            # messages.success(request, ('Item has been edited!'))
            return redirect('home', retro_id=item.retro.id)
    else:
        item = List.objects.get(pk=list_id)
        return render(request, 'edit.html', {'item': item})


@login_required
def main(request):
    user = request.user
    if request.method == 'POST':
        form = RetroForm(request.POST or None)

        if form.is_valid():
            form.save()
            all_retros = Retro.objects.filter(author=user.id)
            retros_with_amount_of_cards = []
            for retro in all_retros:
                retros_with_amount_of_cards.append([retro, retro.list_set.count()])
            return render(request, 'main.html', {'all_retros': all_retros, 'all_items': retros_with_amount_of_cards, 'u': user})
    else:
        all_retros = Retro.objects.filter(author=user.id)
        retros_with_amount_of_cards = []
        for retro in all_retros:
            retros_with_amount_of_cards.append([retro, retro.list_set.count()])
        return render(request, 'main.html', {'all_retros': all_retros, 'all_items': retros_with_amount_of_cards, 'u': user})


def go_to_main(request):
    return redirect('main')


def remove_retro(request, retro_id):
    item = Retro.objects.get(pk=retro_id)
    item.delete()
    return redirect('main')


def dashboard(request):
    return render(request, 'dashboard.html')


def register(request):
    isValid = True
    if request.method == "GET":
        isValid = True
        return render(request, "register.html", {"form": UserCreationForm, "isValid": isValid})
    elif request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            isValid = True
            user = form.save()
            login(request, user)
            return redirect(reverse("dashboard"))
        else:
            isValid = False
            return render(request, "register.html", {"form": UserCreationForm, "isValid": isValid})


def settings(request, retro_id):
    retro = Retro.objects.get(pk=retro_id)
    author = retro.author
    return render(request, 'settings.html', {'retro_id': retro_id, 'author': author})



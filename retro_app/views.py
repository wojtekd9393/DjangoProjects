from django.shortcuts import render, redirect, get_object_or_404
from .models import List, Retro
from .forms import ListForm, RetroForm
from django.urls import reverse
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.forms.models import model_to_dict

# Create your views here.


def home(request, retro_id):
    if request.method == 'POST':
        form = ListForm(request.POST or None)
        if form.is_valid():
            new_task = form.save()
            return JsonResponse({'task': model_to_dict(new_task), 'retro_id': retro_id}, status=200)
    else:
        retro = Retro.objects.get(pk=retro_id)
        all_items = List.objects.filter(retro=retro_id)
        cards_with_amount_of_votes = []
        my_votes = 0
        for card in all_items:
            cards_with_amount_of_votes.append([card, card.get_votes()])
            if request.user in card.votes.all():
                my_votes = my_votes + 1
        if my_votes >= retro.votes:
            limit = True
        else:
            limit = False
        return render(request, 'home.html', {'all_items': all_items, 'retro_id': retro_id, 'retro': retro, "cards": cards_with_amount_of_votes, 'limit': limit})


def delete(request, list_id):
    item = List.objects.get(pk=list_id)
    item.delete()
    return JsonResponse({'result': 'ok'}, status=200)


def edit(request, list_id):
    if request.method == 'POST':
        item = List.objects.get(pk=list_id)
        form = ListForm(request.POST or None, instance=item)
        if form.is_valid():
            form.save()
            return redirect('home', retro_id=item.retro.id)
        else:
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
            all_retros = Retro.objects.filter(author=user.id, archived=False)
            retros_with_amount_of_cards = []
            for retro in all_retros:
                retros_with_amount_of_cards.append([retro, retro.list_set.count()])
            return render(request, 'main.html', {'all_retros': retros_with_amount_of_cards})
        else:
            return redirect('main')
    else:
        all_retros = Retro.objects.filter(author=user.id, archived=False)
        retros_with_amount_of_cards = []
        for retro in all_retros:
            retros_with_amount_of_cards.append([retro, retro.list_set.count()])
        return render(request, 'main.html', {'all_retros': retros_with_amount_of_cards})


def remove_retro(request, retro_id):
    item = Retro.objects.get(pk=retro_id)
    item.delete()
    return redirect('main')


def dashboard(request):
    return render(request, 'dashboard.html')


def register(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(reverse("dashboard"))
        else:
            return render(request, "register.html", {"form": UserCreationForm})
    else:
        return render(request, "register.html", {"form": UserCreationForm})


@login_required
def settings(request, retro_id):
    if request.method == "POST":
        retro = Retro.objects.get(pk=retro_id)
        retro.voting = request.POST.get('voting')
        retro.votes = request.POST.get('num_of_votes')
        retro.archived = request.POST.get('archived')
        retro.save()

    # if I changed board settings, I have to get retro instance again to "update" its fields
    retro = Retro.objects.get(pk=retro_id)
    return render(request, 'settings.html', {'retro': retro})


def card_vote(request, card_id):
    card = get_object_or_404(List, id=card_id)
    card.votes.add(request.user)
    retro_id = card.retro.id
    return HttpResponseRedirect(reverse('home', args=[str(retro_id)]))


def card_vote_down(request, card_id):
    card = get_object_or_404(List, id=card_id)
    card.votes.remove(request.user)
    retro_id = card.retro.id
    return HttpResponseRedirect(reverse('home', args=[str(retro_id)]))


@login_required
def archived(request):
    user = request.user
    archived_retros = Retro.objects.filter(author=user.id, archived=True)
    retros_with_amount_of_cards = []
    for retro in archived_retros:
        retros_with_amount_of_cards.append([retro, retro.list_set.count()])
    return render(request, 'archived.html', {'all_retros': retros_with_amount_of_cards})


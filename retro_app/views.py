from django.shortcuts import render, redirect, get_object_or_404
from .models import List, Retro
from .forms import ListForm, RetroForm
from django.urls import reverse
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.forms.models import model_to_dict


@login_required
def home(request, retro_id):
    if request.method == 'POST':
        form = ListForm(request.POST or None)
        if form.is_valid():
            new_card = form.save(commit=False)
            retro = Retro.objects.get(pk=retro_id)
            new_card.retro = retro
            new_card.save()
            return JsonResponse({'task': model_to_dict(new_card)}, status=200)
    else:
        retro = Retro.objects.get(pk=retro_id)
        cards = List.objects.filter(retro=retro)
        my_votes_number = cards.filter(votes=request.user).count()
        if my_votes_number == retro.votes:
            limit = True
        else:
            limit = False

        green_cards = cards.filter(category=1)
        red_cards = cards.filter(category=2)
        blue_cards = cards.filter(category=3)

        context = {
            'retro': retro,
            'green_cards': green_cards,
            'red_cards': red_cards,
            'blue_cards': blue_cards,
            'limit': limit
        }
        return render(request, 'home.html', context)


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
        item = List.objects.get(pk=list_id)
        return render(request, 'edit.html', {'item': item})


@login_required
def main(request):
    if request.method == 'POST':
        form = RetroForm(request.POST or None)
        if form.is_valid():
            form.save()
            all_retros = Retro.objects.filter(author=request.user.id, archived=False)
            retros_with_authors = []
            for retro in all_retros:
                retros_with_authors.append((retro, get_num_of_authors(retro)))
            context = {'all_retros': retros_with_authors}
            return render(request, 'main.html', context)
        else:
            return redirect('main')
    else:
        all_retros = Retro.objects.filter(author=request.user.id, archived=False)
        retros_with_authors = []
        for retro in all_retros:
            retros_with_authors.append((retro, get_num_of_authors(retro)))
        context = {'all_retros': retros_with_authors}
        return render(request, 'main.html', context)


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

    # if I change board settings, I have to get retro instance again to "update" its fields
    retro = Retro.objects.get(pk=retro_id)
    return render(request, 'settings.html', {'retro': retro})


@login_required
def archive(request, retro_id):
    retro = Retro.objects.get(pk=retro_id)
    retro.archived = True
    retro.save()
    return redirect('main')


@login_required
def restore_retro(request, retro_id):
    retro = Retro.objects.get(pk=retro_id)
    retro.archived = False
    retro.save()
    return redirect('archived')


def card_vote(request, card_id):
    card = get_object_or_404(List, id=card_id)
    active = True
    cards = {}
    if request.user not in card.votes.all():
        card.votes.add(request.user)
        retro = card.retro
        my_votes = List.objects.filter(retro=retro, votes=request.user).count()
        if my_votes == retro.votes:
            active = False
            # cards without user's votes
            cards = retro.cards.exclude(votes=request.user)
        return JsonResponse({'active': active, 'cards': list(cards.values())}, status=200)


def card_vote_down(request, card_id):
    card = get_object_or_404(List, id=card_id)
    if request.user in card.votes.all():
        card.votes.remove(request.user)
        retro = card.retro
        # cards without user's votes
        cards = retro.cards.exclude(votes=request.user)
        return JsonResponse({'cards': list(cards.values())}, status=200)


@login_required
def archived(request):
    archived_retros = Retro.objects.filter(author=request.user.id, archived=True)
    retros_with_authors = []
    for retro in archived_retros:
        retros_with_authors.append((retro, get_num_of_authors(retro)))
    context = {'all_retros': retros_with_authors}
    return render(request, 'archived.html', context)


# helper functions
def get_num_of_authors(retro):
    authors = []
    for card in retro.cards.all():
        if card.author not in authors:
            authors.append(card.author)
    return len(authors)

from django.shortcuts import render, redirect, get_object_or_404
from .models import Card, Retro
from .forms import CardForm, RetroForm
from django.urls import reverse
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.forms.models import model_to_dict


@login_required
def home(request, retro_id):
    if request.method == 'POST':
        form = CardForm(request.POST or None)
        if form.is_valid():
            new_card = form.save(commit=False)
            retro = Retro.objects.get(pk=retro_id)
            new_card.retro = retro
            new_card.author = request.user
            new_card.save()
            return JsonResponse({'card': model_to_dict(new_card)}, status=200)
    else:
        retro = Retro.objects.get(pk=retro_id)
        cards = Card.objects.filter(retro=retro)
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


@login_required
def delete(request, card_id):
    card = Card.objects.get(pk=card_id)
    card.delete()
    return JsonResponse({'result': 'ok'}, status=200)


@login_required
def edit(request, card_id):
    card = get_object_or_404(Card, id=card_id)
    if request.method == 'POST':
        form = CardForm(request.POST or None, instance=card)
        if form.is_valid():
            form.save()
        return redirect('home', retro_id=card.retro.id)
    else:
        return render(request, 'edit.html', {'card': card})


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


@login_required
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
    card = get_object_or_404(Card, id=card_id)
    active = True
    cards = {}
    if request.user not in card.votes.all():
        card.votes.add(request.user)
        retro = card.retro
        my_votes = Card.objects.filter(retro=retro, votes=request.user).count()
        if my_votes == retro.votes:
            active = False
            # cards without user's votes
            cards = retro.cards.exclude(votes=request.user)
        return JsonResponse({'active': active, 'cards': list(cards.values())}, status=200)


def card_vote_down(request, card_id):
    card = get_object_or_404(Card, id=card_id)
    if request.user in card.votes.all():
        card.votes.remove(request.user)
        retro = card.retro
        # cards without user's votes
        cards = retro.cards.exclude(votes=request.user)
        return JsonResponse({'cards': list(cards.values())}, status=200)


@login_required
def reset_user_votes(request, retro_id):
    user = request.user
    cards_with_user_votes = user.card_votes.filter(retro_id=retro_id)
    for card in cards_with_user_votes:
        card.votes.remove(user)
    return redirect('home', retro_id=retro_id)
    #return JsonResponse({}, status=200)


@login_required
def archived(request):
    archived_retros = Retro.objects.filter(author=request.user.id, archived=True)
    retros_with_authors = []
    for retro in archived_retros:
        retros_with_authors.append((retro, get_num_of_authors(retro)))
    context = {'all_retros': retros_with_authors}
    return render(request, 'archived.html', context)


def change_retro_name(request, retro_id, new_retro_name):
    retro = Retro.objects.get(pk=retro_id)
    if new_retro_name != "" and retro.name != new_retro_name:
        retro.name = new_retro_name
        retro.save()
    return JsonResponse({}, status=200)


@login_required
def clear_board(request, retro_id):
    retro = Retro.objects.get(pk=retro_id)
    cards = retro.cards.all()
    for card in cards:
        card.delete()
    return redirect('home', retro_id=retro_id)


# helper functions
def get_num_of_authors(retro):
    authors = []
    for card in retro.cards.all():
        if card.author not in authors:
            authors.append(card.author)
    return len(authors)

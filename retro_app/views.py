from multiprocessing import AuthenticationError
from unicodedata import category
from django.shortcuts import render, redirect, get_object_or_404
from .models import Card, Retro
from .forms import CardForm, RetroForm
from django.urls import reverse
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.forms.models import model_to_dict
from django.db.models import Count


@login_required
def home(request, retro_id):
    retro = get_object_or_404(Retro, pk=retro_id)
    if request.method == 'POST':
        form = CardForm(request.POST)
        if form.is_valid():
            new_card = form.save(commit=False)
            new_card.retro = retro
            new_card.author = request.user
            new_card.is_merged = is_card_merged(new_card)
            new_card.save()
            return JsonResponse({'card': model_to_dict(new_card)}, status=200)
    else:
        q = request.GET.get('q') if request.GET.get('q') is not None else ""
        order = request.GET.get('order')
        if order == "votes":
            cards = Card.objects.filter(retro=retro, body__icontains=q) \
                        .annotate(num_votes=Count('votes')) \
                        .order_by('-num_votes', 'id')
        else:
            cards = Card.objects.filter(retro=retro, body__icontains=q)
        my_votes_number = cards.filter(votes=request.user).count()
        limit = True if my_votes_number >= retro.votes else False

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
    card = get_object_or_404(Card, pk=card_id)
    if card.author == request.user:
        card.delete()
        return JsonResponse({}, status=200)
    else:
        return HttpResponse(f"You cannot delete this card. No permissions!")


@login_required
def edit(request, card_id):
    # TODO: can't pass the whole card object using model_to_dict() because User object in votes
    # cannot be serialized - need to think of how to serialize nested objects
    card = get_object_or_404(Card, id=card_id)
    if request.method == 'POST':
        form = CardForm(request.POST, instance=card)
        if form.is_valid():
            updated_card = form.save(commit=False)
            updated_card.is_merged = is_card_merged(updated_card)
            updated_card.save()
        else:
            # TODO: need to handle this case properly, maybe show alert message?
            print("Form errors: ", form.errors)
            
    card_edit_info = {"category": card.category, "body": card.body, "is_merged": card.is_merged}
    return JsonResponse({'card': card_edit_info}, status=200)


@login_required
def main(request):
    if request.method == 'POST':
        form = RetroForm(request.POST)
        if form.is_valid():
            new_retro = form.save(commit=False)
            new_retro.author = request.user
            new_retro.save()
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
    if item.author == request.user:
        item.delete()
        return redirect('main')
    else:
        return HttpResponse(f"You cannot delete this board because you are not its author.")


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
            return render(request, "register.html", {"form": form})
    else:
        form = UserCreationForm()
        return render(request, "register.html", {"form": form})


# TODO: block voting when decreasing number of votes in board settings
# example: limit is 4 votes, user voted 4 times, changed to 3 votes in settings but user can still votes
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
    retro.voting = False
    retro.save()
    return redirect('main')


@login_required
def restore_retro(request, retro_id):
    retro = Retro.objects.get(pk=retro_id)
    retro.archived = False
    retro.save()
    return redirect('archived')


@login_required
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


@login_required
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


@login_required
def archived(request):
    archived_retros = Retro.objects.filter(author=request.user.id, archived=True)
    retros_with_authors = []
    for retro in archived_retros:
        retros_with_authors.append((retro, get_num_of_authors(retro)))
    context = {'all_retros': retros_with_authors}
    return render(request, 'archived.html', context)


@login_required
def change_retro_name(request, retro_id, new_retro_name):
    retro = Retro.objects.get(pk=retro_id)
    if new_retro_name != "" and retro.name != new_retro_name:
        retro.name = new_retro_name
        retro.save()
    return JsonResponse({}, status=200)


@login_required
def clear_board(request, retro_id):
    retro = Retro.objects.get(pk=retro_id)
    retro.cards.all().delete()
    return redirect('home', retro_id=retro_id)


@login_required
def profile(request):
    context = {}
    return render(request, 'my_profile.html', context)


@login_required
def merge(request, dragged_id, dest_id):
    if request.method == 'POST':
        dragged_card = Card.objects.get(pk=dragged_id)
        dest_card = Card.objects.get(pk=dest_id)
        # separate merged cards' content with 3 dashes (---)
        dest_card.body = dest_card.body + "\r\n" + "-" * 3 + "\r\n" + dragged_card.body
        dest_card.is_merged = True
        dest_card.save()
        dragged_card.delete()
        return JsonResponse({'new_body': dest_card.body}, status=200)


@login_required
def unmerge(request, card_id):
    card = get_object_or_404(Card, pk=card_id)
    if is_card_merged(card):
        parts = card.body.split("\r\n---\r\n")
        card.body = parts[0]
        card.is_merged = False
        card.save()

        for part in parts[1:]:
            Card.objects.create(body=part, category=card.category, retro=card.retro, author=request.user)

    return redirect('home', retro_id=card.retro.id)


# helper functions
def get_num_of_authors(retro):
    authors = []
    cards = retro.cards.select_related("author").all()
    for card in cards:
        if card.author not in authors:
            authors.append(card.author)
    return len(authors)


def is_card_merged(card):
    if "\r\n---\r\n" in card.body:
        return True
    return False

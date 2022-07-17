from django.urls import path, include
from retro_app.views import home, delete, edit, main, remove_retro, dashboard, register, settings, card_vote, card_vote_down, archived, archive, restore_retro

urlpatterns = [
    path('', dashboard),
    path('home/<retro_id>', home, name='home'),
    path('delete/item/<list_id>', delete, name='delete'),
    path('edit/<list_id>', edit, name='edit'),
    path('main/', main, name='main'),
    path('delete/retro/<retro_id>', remove_retro, name='remove_retro'),
    path('dashboard', dashboard, name='dashboard'),
    path('register', register, name='register'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('home/<retro_id>/settings/', settings, name="settings"),
    path('vote/<card_id>', card_vote, name="card_vote"),
    path('vote-down/<card_id>', card_vote_down, name="card_vote_down"),
    path('archived/', archived, name="archived"),
    path('archive/<retro_id>', archive, name="archive"),
    path('restore_retro/<retro_id>', restore_retro, name="restore_retro"),
]

"""
include('django.contrib.auth.urls')

This will include the following URL patterns:

accounts/login/ [name='login']
accounts/logout/ [name='logout']
accounts/password_change/ [name='password_change']
accounts/password_change/done/ [name='password_change_done']
accounts/password_reset/ [name='password_reset']
accounts/password_reset/done/ [name='password_reset_done']
accounts/reset/<uidb64>/<token>/ [name='password_reset_confirm']
accounts/reset/done/ [name='password_reset_complete']
"""

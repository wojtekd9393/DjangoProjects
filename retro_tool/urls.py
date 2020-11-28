"""retro_tool URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from retro_app.views import home, delete, edit, main, go_to_main, remove_retro, dashboard

urlpatterns = [
    path('', go_to_main),
    path('admin/', admin.site.urls),
    path('home/<retro_id>', home, name='home'),
    path('delete/item/<list_id>', delete, name='delete'),
    path('edit/<list_id>', edit, name='edit'),
    path('main/', main, name='main'),
    path('delete/retro/<retro_id>', remove_retro, name='remove_retro'),
    path('dashboard', dashboard, name='dashboard'),
    path('accounts/', include('django.contrib.auth.urls'))
]

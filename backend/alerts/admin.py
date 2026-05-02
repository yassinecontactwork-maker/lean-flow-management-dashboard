"""
Admin configuration pour l'application Alerts
"""
from django.contrib import admin
from .models import Alerte, Conflit


@admin.register(Alerte)
class AlerteAdmin(admin.ModelAdmin):
    list_display = ['type_alerte', 'severite', 'statut', 'article', 'poste', 'date_creation']
    search_fields = ['message', 'article__sku', 'poste__nom']
    list_filter = ['type_alerte', 'severite', 'statut', 'date_creation']
    readonly_fields = ['date_creation', 'date_resolution']


@admin.register(Conflit)
class ConflitAdmin(admin.ModelAdmin):
    list_display = ['type_conflit', 'article', 'poste', 'priorite', 'statut', 'date_creation']
    search_fields = ['description', 'article__sku', 'poste__nom']
    list_filter = ['type_conflit', 'statut', 'priorite', 'date_creation']
    readonly_fields = ['date_creation', 'date_resolution']

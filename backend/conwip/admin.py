"""
Admin configuration pour l'application CONWIP
"""
from django.contrib import admin
from .models import LigneProduction, SequencePoste, TicketConwip


class SequencePosteInline(admin.TabularInline):
    model = SequencePoste
    extra = 1


@admin.register(LigneProduction)
class LigneProductionAdmin(admin.ModelAdmin):
    list_display = ['nom', 'wip_critique', 'active']
    search_fields = ['nom']
    list_filter = ['active']
    inlines = [SequencePosteInline]


@admin.register(TicketConwip)
class TicketConwipAdmin(admin.ModelAdmin):
    list_display = ['numero', 'ligne', 'statut', 'poste_actuel', 'ordre_fabrication']
    search_fields = ['numero']
    list_filter = ['statut', 'ligne']
    readonly_fields = ['numero', 'date_creation']

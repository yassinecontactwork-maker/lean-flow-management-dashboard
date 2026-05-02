"""
Admin configuration pour l'application Kanban
"""
from django.contrib import admin
from .models import ConfigFluxKanban, CarteKanban


@admin.register(ConfigFluxKanban)
class ConfigFluxKanbanAdmin(admin.ModelAdmin):
    list_display = ['article', 'poste_fournisseur', 'poste_consommateur', 
                    'capacite_conteneur', 'nombre_cartes_optimal', 'actif']
    search_fields = ['article__sku', 'poste_fournisseur__nom', 'poste_consommateur__nom']
    list_filter = ['actif', 'date_creation']
    readonly_fields = ['nombre_cartes_optimal', 'date_creation', 'date_modification']


@admin.register(CarteKanban)
class CarteKanbanAdmin(admin.ModelAdmin):
    list_display = ['code_unique', 'flux', 'statut', 'quantite', 'date_dernier_scan']
    search_fields = ['code_unique', 'flux__article__sku']
    list_filter = ['statut', 'date_creation']
    readonly_fields = ['code_unique', 'qr_code', 'date_creation']

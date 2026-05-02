"""
Admin configuration pour l'application DDMRP
"""
from django.contrib import admin
from .models import BufferDDMRP, Recommandation


@admin.register(BufferDDMRP)
class BufferDDMRPAdmin(admin.ModelAdmin):
    list_display = ['article', 'poste', 'stock_disponible', 'zone_rouge', 
                    'zone_jaune', 'zone_verte', 'actif']
    search_fields = ['article__sku', 'poste__nom']
    list_filter = ['actif', 'date_creation']
    readonly_fields = ['zone_rouge', 'zone_jaune', 'zone_verte', 
                       'date_creation', 'date_modification', 'date_dernier_calcul']


@admin.register(Recommandation)
class RecommandationAdmin(admin.ModelAdmin):
    list_display = ['buffer', 'type_recommandation', 'quantite', 'priorite', 'statut', 'date_creation']
    search_fields = ['buffer__article__sku']
    list_filter = ['type_recommandation', 'statut', 'priorite', 'date_creation']
    readonly_fields = ['date_creation', 'ordre_fabrication']

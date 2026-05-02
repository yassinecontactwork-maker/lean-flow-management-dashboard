"""
Admin configuration pour l'application Core
"""
from django.contrib import admin
from .models import Article, PosteTravail, OrdreFabrication


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['sku', 'designation', 'adu', 'lead_time', 'stock_physique', 'stock_securite']
    search_fields = ['sku', 'designation']
    list_filter = ['date_creation']


@admin.register(PosteTravail)
class PosteTravailAdmin(admin.ModelAdmin):
    list_display = ['nom', 'capacite_horaire', 'est_goulet']
    search_fields = ['nom']
    list_filter = ['est_goulet']


@admin.register(OrdreFabrication)
class OrdreFabricationAdmin(admin.ModelAdmin):
    list_display = ['numero', 'article', 'poste', 'quantite', 'statut', 'priorite', 'source', 'date_creation']
    search_fields = ['numero', 'article__sku']
    list_filter = ['statut', 'priorite', 'source', 'date_creation']
    readonly_fields = ['date_creation', 'date_debut', 'date_fin']

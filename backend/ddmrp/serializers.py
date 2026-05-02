"""
Serializers de l'application DDMRP
"""
from rest_framework import serializers
from .models import BufferDDMRP, Recommandation
from core.serializers import ArticleSerializer, PosteTravailSerializer, OrdreFabricationSerializer


class BufferDDMRPSerializer(serializers.ModelSerializer):
    """
    Serializer pour BufferDDMRP
    """
    article_detail = ArticleSerializer(source='article', read_only=True)
    poste_detail = PosteTravailSerializer(source='poste', read_only=True)
    niveau_actuel = serializers.SerializerMethodField()
    quantite_reappro_optimale = serializers.SerializerMethodField()
    pourcentage_remplissage = serializers.SerializerMethodField()

    class Meta:
        model = BufferDDMRP
        fields = [
            'id', 'article', 'article_detail', 'poste', 'poste_detail',
            'adu', 'lead_time_jours', 'facteur_lead_time', 'facteur_variabilite',
            'stock_minimum_commande', 'zone_rouge', 'zone_jaune', 'zone_verte',
            'stock_disponible', 'niveau_actuel', 'quantite_reappro_optimale',
            'pourcentage_remplissage', 'actif',
            'date_creation', 'date_modification', 'date_dernier_calcul'
        ]
        read_only_fields = [
            'zone_rouge', 'zone_jaune', 'zone_verte',
            'date_creation', 'date_modification', 'date_dernier_calcul'
        ]

    def get_niveau_actuel(self, obj):
        """Niveau actuel du buffer"""
        return obj.get_niveau_actuel()

    def get_quantite_reappro_optimale(self, obj):
        """Quantité de réapprovisionnement optimale"""
        return float(obj.get_quantite_reappro_optimale())

    def get_pourcentage_remplissage(self, obj):
        """Pourcentage de remplissage du buffer"""
        total = float(obj.zone_rouge + obj.zone_jaune + obj.zone_verte)
        if total > 0:
            return round((float(obj.stock_disponible) / total) * 100, 2)
        return 0


class RecommandationSerializer(serializers.ModelSerializer):
    """
    Serializer pour Recommandation
    """
    buffer_detail = serializers.SerializerMethodField()
    ordre_fabrication_detail = OrdreFabricationSerializer(source='ordre_fabrication', read_only=True)

    class Meta:
        model = Recommandation
        fields = [
            'id', 'buffer', 'buffer_detail', 'type_recommandation',
            'quantite', 'priorite', 'statut', 'justification',
            'ordre_fabrication', 'ordre_fabrication_detail',
            'date_creation', 'date_execution'
        ]
        read_only_fields = ['date_creation', 'ordre_fabrication']

    def get_buffer_detail(self, obj):
        """Détails simplifiés du buffer"""
        return {
            'id': obj.buffer.id,
            'article_sku': obj.buffer.article.sku,
            'article_designation': obj.buffer.article.designation,
            'poste_nom': obj.buffer.poste.nom,
            'niveau_actuel': obj.buffer.get_niveau_actuel()
        }

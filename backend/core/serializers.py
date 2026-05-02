"""
Serializers de l'application Core
"""
from rest_framework import serializers
from .models import Article, PosteTravail, OrdreFabrication


class ArticleSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'entité Article
    """
    class Meta:
        model = Article
        fields = [
            'id', 'sku', 'designation', 'adu', 'lead_time',
            'stock_physique', 'stock_securite', 'prix_unitaire',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['date_creation', 'date_modification']


class PosteTravailSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'entité Poste de Travail
    """
    class Meta:
        model = PosteTravail
        fields = [
            'id', 'nom', 'capacite_horaire', 'est_goulet',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['date_creation', 'date_modification']


class OrdreFabricationSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'entité Ordre de Fabrication
    """
    article_detail = ArticleSerializer(source='article', read_only=True)
    poste_detail = PosteTravailSerializer(source='poste', read_only=True)
    
    class Meta:
        model = OrdreFabrication
        fields = [
            'id', 'numero', 'article', 'article_detail', 'poste', 'poste_detail',
            'quantite', 'statut', 'priorite', 'source',
            'date_creation', 'date_debut', 'date_fin', 'date_livraison_prevue'
        ]
        read_only_fields = ['date_creation']

    def validate_numero(self, value):
        """Validation du numéro OF"""
        if self.instance is None:            
            if OrdreFabrication.objects.filter(numero=value).exists():
                raise serializers.ValidationError("Ce numéro d'OF existe déjà.")
        return value

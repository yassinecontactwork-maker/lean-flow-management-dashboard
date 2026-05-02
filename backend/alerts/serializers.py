"""
Serializers de l'application Alerts
"""
from rest_framework import serializers
from .models import Alerte, Conflit
from core.serializers import ArticleSerializer, PosteTravailSerializer


class AlerteSerializer(serializers.ModelSerializer):
    """
    Serializer pour Alerte
    """
    article_detail = ArticleSerializer(source='article', read_only=True)
    poste_detail = PosteTravailSerializer(source='poste', read_only=True)

    class Meta:
        model = Alerte
        fields = [
            'id', 'type_alerte', 'severite', 'statut', 'message', 'details',
            'article', 'article_detail', 'poste', 'poste_detail',
            'ordre_fabrication', 'date_creation', 'date_resolution'
        ]
        read_only_fields = ['date_creation']


class ConflitSerializer(serializers.ModelSerializer):
    """
    Serializer pour Conflit
    """
    article_detail = ArticleSerializer(source='article', read_only=True)
    poste_detail = PosteTravailSerializer(source='poste', read_only=True)

    class Meta:
        model = Conflit
        fields = [
            'id', 'type_conflit', 'statut', 'description', 'priorite',
            'article', 'article_detail', 'poste', 'poste_detail',
            'signal_kanban', 'signal_conwip', 'signal_ddmrp',
            'decision', 'date_creation', 'date_resolution'
        ]
        read_only_fields = ['date_creation']


class ResolutionConflitSerializer(serializers.Serializer):
    """
    Serializer pour la résolution d'un conflit
    """
    methode = serializers.ChoiceField(
        choices=['KANBAN', 'CONWIP', 'DDMRP', 'MANUEL'],
        required=True,
        help_text="Méthode de résolution choisie"
    )
    decision = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Explication de la décision"
    )

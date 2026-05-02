"""
Serializers de l'application Kanban
"""
from rest_framework import serializers
from .models import ConfigFluxKanban, CarteKanban
from core.serializers import ArticleSerializer, PosteTravailSerializer


class ConfigFluxKanbanSerializer(serializers.ModelSerializer):
    """
    Serializer pour ConfigFluxKanban
    """
    article_detail = ArticleSerializer(source='article', read_only=True)
    poste_fournisseur_detail = PosteTravailSerializer(source='poste_fournisseur', read_only=True)
    poste_consommateur_detail = PosteTravailSerializer(source='poste_consommateur', read_only=True)
    nombre_cartes_actuelles = serializers.SerializerMethodField()
    nombre_cartes_vides = serializers.SerializerMethodField()

    class Meta:
        model = ConfigFluxKanban
        fields = [
            'id', 'article', 'article_detail',
            'poste_fournisseur', 'poste_fournisseur_detail',
            'poste_consommateur', 'poste_consommateur_detail',
            'demande_moyenne', 'lead_time_jours', 'capacite_conteneur',
            'nombre_cartes_optimal', 'nombre_cartes_actuelles', 'nombre_cartes_vides',
            'actif', 'date_creation', 'date_modification'
        ]
        read_only_fields = ['nombre_cartes_optimal', 'date_creation', 'date_modification']

    def get_nombre_cartes_actuelles(self, obj):
        """Nombre total de cartes créées pour ce flux"""
        return obj.cartes.count()

    def get_nombre_cartes_vides(self, obj):
        """Nombre de cartes vides (déclenchant réappro)"""
        return obj.cartes.filter(statut='VIDE').count()


class CarteKanbanSerializer(serializers.ModelSerializer):
    """
    Serializer pour CarteKanban
    """
    flux_detail = ConfigFluxKanbanSerializer(source='flux', read_only=True)
    qr_code_url = serializers.SerializerMethodField()

    class Meta:
        model = CarteKanban
        fields = [
            'id', 'flux', 'flux_detail', 'code_unique', 'statut',
            'quantite', 'qr_code', 'qr_code_url', 'ordre_fabrication',
            'date_creation', 'date_dernier_scan'
        ]
        read_only_fields = ['code_unique', 'qr_code', 'date_creation']

    def get_qr_code_url(self, obj):
        """URL complète du QR code"""
        if obj.qr_code:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.qr_code.url)
        return None


class ScanCarteSerializer(serializers.Serializer):
    """
    Serializer pour le scan d'une carte Kanban
    """
    code_unique = serializers.CharField(required=True)
    nouveau_statut = serializers.ChoiceField(
        choices=['PLEIN', 'VIDE'],
        required=False,
        help_text="Si non fourni, le statut sera inversé automatiquement"
    )

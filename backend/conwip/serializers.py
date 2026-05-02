"""
Serializers de l'application CONWIP
"""
from rest_framework import serializers
from .models import LigneProduction, SequencePoste, TicketConwip
from core.serializers import PosteTravailSerializer, OrdreFabricationSerializer


class SequencePosteSerializer(serializers.ModelSerializer):
    """
    Serializer pour SequencePoste
    """
    poste_detail = PosteTravailSerializer(source='poste', read_only=True)

    class Meta:
        model = SequencePoste
        fields = ['id', 'poste', 'poste_detail', 'ordre']


class LigneProductionSerializer(serializers.ModelSerializer):
    """
    Serializer pour LigneProduction
    """
    sequence = SequencePosteSerializer(source='sequenceposte_set', many=True, read_only=True)
    wip_actuel = serializers.SerializerMethodField()
    est_saturee = serializers.SerializerMethodField()
    goulet = serializers.SerializerMethodField()

    class Meta:
        model = LigneProduction
        fields = [
            'id', 'nom', 'description', 'wip_critique', 'wip_actuel',
            'est_saturee', 'goulet', 'sequence', 'active',
            'date_creation', 'date_modification'
        ]
        read_only_fields = ['date_creation', 'date_modification']

    def get_wip_actuel(self, obj):
        """WIP actuel de la ligne"""
        return obj.get_wip_actuel()

    def get_est_saturee(self, obj):
        """Indique si la ligne est saturée"""
        return obj.est_saturee()

    def get_goulet(self, obj):
        """Poste goulet dans la ligne"""
        goulet = obj.get_goulet()
        if goulet:
            return PosteTravailSerializer(goulet).data
        return None


class TicketConwipSerializer(serializers.ModelSerializer):
    """
    Serializer pour TicketConwip
    """
    ligne_detail = serializers.SerializerMethodField()
    ordre_fabrication_detail = OrdreFabricationSerializer(source='ordre_fabrication', read_only=True)
    poste_actuel_detail = PosteTravailSerializer(source='poste_actuel', read_only=True)

    class Meta:
        model = TicketConwip
        fields = [
            'id', 'ligne', 'ligne_detail', 'numero', 'statut',
            'ordre_fabrication', 'ordre_fabrication_detail',
            'poste_actuel', 'poste_actuel_detail',
            'date_creation', 'date_liberation', 'date_attribution'
        ]
        read_only_fields = ['numero', 'date_creation']

    def get_ligne_detail(self, obj):
        """Détails de la ligne (sans la séquence complète)"""
        return {
            'id': obj.ligne.id,
            'nom': obj.ligne.nom,
            'wip_critique': obj.ligne.wip_critique
        }


class AttributionTicketSerializer(serializers.Serializer):
    """
    Serializer pour l'attribution d'un ticket CONWIP à un OF
    """
    ordre_fabrication_id = serializers.IntegerField(required=True)
    poste_depart_id = serializers.IntegerField(required=False)

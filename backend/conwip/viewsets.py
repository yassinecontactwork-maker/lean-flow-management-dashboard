"""
ViewSets de l'application CONWIP
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import LigneProduction, SequencePoste, TicketConwip
from .serializers import (
    LigneProductionSerializer, SequencePosteSerializer,
    TicketConwipSerializer, AttributionTicketSerializer
)
from core.models import OrdreFabrication, PosteTravail


class LigneProductionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les lignes de production CONWIP
    """
    queryset = LigneProduction.objects.prefetch_related('sequenceposte_set__poste').all()
    serializer_class = LigneProductionSerializer

    @action(detail=True, methods=['post'])
    def ajouter_poste(self, request, pk=None):
        """
        Ajoute un poste à la séquence de la ligne
        """
        ligne = self.get_object()
        poste_id = request.data.get('poste_id')
        ordre = request.data.get('ordre')

        if not poste_id or not ordre:
            return Response(
                {'error': 'poste_id et ordre sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            poste = PosteTravail.objects.get(id=poste_id)
            sequence = SequencePoste.objects.create(
                ligne=ligne,
                poste=poste,
                ordre=ordre
            )
            serializer = SequencePosteSerializer(sequence)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except PosteTravail.DoesNotExist:
            return Response(
                {'error': 'Poste de travail introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def creer_tickets(self, request, pk=None):
        """
        Crée les tickets CONWIP pour atteindre le WIP critique
        """
        ligne = self.get_object()
        nombre_actuel = ligne.tickets_conwip.count()
        nombre_a_creer = ligne.wip_critique - nombre_actuel

        if nombre_a_creer <= 0:
            return Response({
                'message': 'Le nombre de tickets optimal est déjà atteint',
                'nombre_actuel': nombre_actuel,
                'wip_critique': ligne.wip_critique
            })

        tickets_crees = []
        for i in range(nombre_a_creer):
            count = ligne.tickets_conwip.count() + 1
            numero = f"CONWIP-{ligne.nom}-{count:04d}"
            ticket = TicketConwip.objects.create(
                ligne=ligne,
                numero=numero,
                statut='LIBRE'
            )
            tickets_crees.append(ticket)

        serializer = TicketConwipSerializer(tickets_crees, many=True)
        return Response({
            'message': f'{nombre_a_creer} ticket(s) créé(s)',
            'tickets': serializer.data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def statistiques(self, request, pk=None):
        """Statistiques de la ligne"""
        ligne = self.get_object()
        tickets = ligne.tickets_conwip.all()

        return Response({
            'ligne': ligne.nom,
            'wip_critique': ligne.wip_critique,
            'wip_actuel': ligne.get_wip_actuel(),
            'est_saturee': ligne.est_saturee(),
            'tickets_total': tickets.count(),
            'tickets_libres': tickets.filter(statut='LIBRE').count(),
            'tickets_en_attente': tickets.filter(statut='EN_ATTENTE').count(),
            'tickets_en_cours': tickets.filter(statut='EN_COURS').count(),
            'goulet': PosteTravailSerializer(ligne.get_goulet()).data if ligne.get_goulet() else None
        })


class TicketConwipViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les tickets CONWIP
    """
    queryset = TicketConwip.objects.select_related(
        'ligne', 'ordre_fabrication', 'poste_actuel'
    ).all()
    serializer_class = TicketConwipSerializer

    def get_queryset(self):
        """Filtrage par ligne et statut"""
        queryset = super().get_queryset()
        ligne_id = self.request.query_params.get('ligne', None)
        statut = self.request.query_params.get('statut', None)

        if ligne_id:
            queryset = queryset.filter(ligne_id=ligne_id)
        if statut:
            queryset = queryset.filter(statut=statut)

        return queryset

    @action(detail=True, methods=['post'])
    def attribuer(self, request, pk=None):
        """
        Attribue un ticket libre à un ordre de fabrication
        """
        ticket = self.get_object()

        if ticket.statut != 'LIBRE':
            return Response(
                {'error': 'Ce ticket n\'est pas libre'},
                status=status.HTTP_400_BAD_REQUEST
            )

        attr_serializer = AttributionTicketSerializer(data=request.data)
        if not attr_serializer.is_valid():
            return Response(attr_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        ordre_id = attr_serializer.validated_data['ordre_fabrication_id']
        poste_depart_id = attr_serializer.validated_data.get('poste_depart_id')

        try:
            with transaction.atomic():
                ordre = OrdreFabrication.objects.get(id=ordre_id)

                                               
                if poste_depart_id:
                    poste_depart = PosteTravail.objects.get(id=poste_depart_id)
                else:
                                                             
                    premiere_sequence = ticket.ligne.sequenceposte_set.order_by('ordre').first()
                    if not premiere_sequence:
                        return Response(
                            {'error': 'La ligne n\'a pas de séquence de postes définie'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    poste_depart = premiere_sequence.poste

                ticket.attribuer(ordre, poste_depart)

                serializer = self.get_serializer(ticket)
                return Response({
                    'ticket': serializer.data,
                    'message': f'Ticket attribué à l\'OF {ordre.numero}'
                })

        except OrdreFabrication.DoesNotExist:
            return Response(
                {'error': 'Ordre de fabrication introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        except PosteTravail.DoesNotExist:
            return Response(
                {'error': 'Poste de travail introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def liberer(self, request, pk=None):
        """Libère un ticket (fin d'OF)"""
        ticket = self.get_object()

        if ticket.statut == 'LIBRE':
            return Response(
                {'error': 'Ce ticket est déjà libre'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.liberer()
        serializer = self.get_serializer(ticket)
        return Response({
            'ticket': serializer.data,
            'message': 'Ticket libéré'
        })

    @action(detail=True, methods=['post'])
    def demarrer(self, request, pk=None):
        """Démarre le traitement (EN_ATTENTE → EN_COURS)"""
        ticket = self.get_object()

        if ticket.statut != 'EN_ATTENTE':
            return Response(
                {'error': 'Le ticket doit être en attente pour être démarré'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.demarrer()
        serializer = self.get_serializer(ticket)
        return Response({
            'ticket': serializer.data,
            'message': 'Ticket démarré'
        })

    @action(detail=True, methods=['post'])
    def avancer(self, request, pk=None):
        """Fait avancer le ticket au poste suivant"""
        ticket = self.get_object()
        prochain_poste_id = request.data.get('prochain_poste_id')

        if not prochain_poste_id:
            return Response(
                {'error': 'prochain_poste_id est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            prochain_poste = PosteTravail.objects.get(id=prochain_poste_id)
            ticket.avancer_poste(prochain_poste)
            serializer = self.get_serializer(ticket)
            return Response({
                'ticket': serializer.data,
                'message': f'Ticket avancé au poste {prochain_poste.nom}'
            })
        except PosteTravail.DoesNotExist:
            return Response(
                {'error': 'Poste de travail introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )

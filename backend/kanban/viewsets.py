"""
ViewSets de l'application Kanban
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from .models import ConfigFluxKanban, CarteKanban
from .serializers import ConfigFluxKanbanSerializer, CarteKanbanSerializer, ScanCarteSerializer
from core.models import OrdreFabrication


class ConfigFluxKanbanViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les configurations de flux Kanban
    """
    queryset = ConfigFluxKanban.objects.select_related(
        'article', 'poste_fournisseur', 'poste_consommateur'
    ).all()
    serializer_class = ConfigFluxKanbanSerializer

    @action(detail=True, methods=['post'])
    def creer_cartes(self, request, pk=None):
        """
        Crée les cartes Kanban pour atteindre le nombre optimal
        """
        flux = self.get_object()
        nombre_actuel = flux.cartes.count()
        nombre_a_creer = flux.nombre_cartes_optimal - nombre_actuel

        if nombre_a_creer <= 0:
            return Response({
                'message': 'Le nombre de cartes optimal est déjà atteint',
                'nombre_actuel': nombre_actuel,
                'nombre_optimal': flux.nombre_cartes_optimal
            })

        cartes_creees = []
        for _ in range(nombre_a_creer):
            carte = CarteKanban.objects.create(
                flux=flux,
                statut='PLEIN',
                quantite=flux.capacite_conteneur
            )
            cartes_creees.append(carte)

        serializer = CarteKanbanSerializer(cartes_creees, many=True, context={'request': request})
        return Response({
            'message': f'{nombre_a_creer} carte(s) créée(s)',
            'cartes': serializer.data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def cartes_vides(self, request, pk=None):
        """Retourne les cartes vides du flux"""
        flux = self.get_object()
        cartes = flux.cartes.filter(statut='VIDE')
        serializer = CarteKanbanSerializer(cartes, many=True, context={'request': request})
        return Response(serializer.data)


class CarteKanbanViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les cartes Kanban
    """
    queryset = CarteKanban.objects.select_related('flux__article', 'flux__poste_fournisseur').all()
    serializer_class = CarteKanbanSerializer

    def get_queryset(self):
        """Filtrage par statut et flux"""
        queryset = super().get_queryset()
        statut = self.request.query_params.get('statut', None)
        flux_id = self.request.query_params.get('flux', None)

        if statut:
            queryset = queryset.filter(statut=statut)
        if flux_id:
            queryset = queryset.filter(flux_id=flux_id)

        return queryset

    @action(detail=False, methods=['post'])
    def scanner(self, request):
        """
        Scan d'une carte Kanban (webcam ou saisie manuelle)
        Change le statut et génère un OF si passage à VIDE
        """
        scan_serializer = ScanCarteSerializer(data=request.data)
        if not scan_serializer.is_valid():
            return Response(scan_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code_unique = scan_serializer.validated_data['code_unique']
        nouveau_statut = scan_serializer.validated_data.get('nouveau_statut')

        try:
            carte = CarteKanban.objects.select_related('flux__article', 'flux__poste_fournisseur').get(
                code_unique=code_unique
            )
        except CarteKanban.DoesNotExist:
            return Response(
                {'error': f'Carte {code_unique} introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )

        ancien_statut = carte.statut

                                      
        if nouveau_statut:
            carte.statut = nouveau_statut
        else:
                                   
            carte.statut = 'VIDE' if ancien_statut == 'PLEIN' else 'PLEIN'

        carte.date_dernier_scan = timezone.now()

                                                                 
        ordre_cree = None
        if ancien_statut == 'PLEIN' and carte.statut == 'VIDE':
            with transaction.atomic():
                                               
                from datetime import datetime
                timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                numero_of = f"OF-KAN-{carte.flux.article.sku}-{timestamp}"

                ordre = OrdreFabrication.objects.create(
                    numero=numero_of,
                    article=carte.flux.article,
                    poste=carte.flux.poste_fournisseur,
                    quantite=carte.flux.capacite_conteneur,
                    statut='EN_ATTENTE',
                    priorite=2,                              
                    source='KANBAN'
                )
                carte.ordre_fabrication = ordre
                ordre_cree = ordre

        carte.save()

                             
        response_data = {
            'carte': CarteKanbanSerializer(carte, context={'request': request}).data,
            'ancien_statut': ancien_statut,
            'nouveau_statut': carte.statut,
            'message': f'Carte scannée : {ancien_statut} → {carte.statut}'
        }

        if ordre_cree:
            from core.serializers import OrdreFabricationSerializer
            response_data['ordre_cree'] = OrdreFabricationSerializer(ordre_cree).data
            response_data['message'] += f' | OF {ordre_cree.numero} créé'

        return Response(response_data)

    @action(detail=True, methods=['post'])
    def changer_statut(self, request, pk=None):
        """Change manuellement le statut d'une carte"""
        carte = self.get_object()
        nouveau_statut = request.data.get('statut')

        if nouveau_statut not in ['PLEIN', 'VIDE']:
            return Response(
                {'error': 'Statut invalide. Utilisez PLEIN ou VIDE'},
                status=status.HTTP_400_BAD_REQUEST
            )

        ancien_statut = carte.statut
        carte.statut = nouveau_statut
        carte.date_dernier_scan = timezone.now()
        carte.save()

        serializer = self.get_serializer(carte)
        return Response({
            'carte': serializer.data,
            'ancien_statut': ancien_statut,
            'nouveau_statut': nouveau_statut
        })

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Statistiques globales sur les cartes Kanban"""
        total = CarteKanban.objects.count()
        pleines = CarteKanban.objects.filter(statut='PLEIN').count()
        vides = CarteKanban.objects.filter(statut='VIDE').count()

        return Response({
            'total': total,
            'pleines': pleines,
            'vides': vides,
            'taux_remplissage': round((pleines / total * 100) if total > 0 else 0, 2)
        })

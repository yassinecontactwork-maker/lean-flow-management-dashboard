"""
ViewSets de l'application DDMRP
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from decimal import Decimal
from .models import BufferDDMRP, Recommandation
from .serializers import BufferDDMRPSerializer, RecommandationSerializer


class BufferDDMRPViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les Buffers DDMRP
    """
    queryset = BufferDDMRP.objects.select_related('article', 'poste').all()
    serializer_class = BufferDDMRPSerializer

    @action(detail=True, methods=['post'])
    def recalculer_zones(self, request, pk=None):
        """
        Recalcule les zones rouge/jaune/verte du buffer
        """
        buffer = self.get_object()
        buffer.calculer_zones()
        buffer.save()

        serializer = self.get_serializer(buffer)
        return Response({
            'buffer': serializer.data,
            'message': 'Zones recalculées avec succès'
        })

    @action(detail=True, methods=['post'])
    def ajuster_stock(self, request, pk=None):
        """
        Ajuste le stock disponible du buffer
        """
        buffer = self.get_object()
        nouveau_stock = request.data.get('stock')

        if nouveau_stock is None:
            return Response(
                {'error': 'Le champ stock est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            buffer.stock_disponible = Decimal(str(nouveau_stock))
            buffer.save()

            serializer = self.get_serializer(buffer)
            return Response({
                'buffer': serializer.data,
                'message': f'Stock ajusté à {nouveau_stock}'
            })
        except (ValueError, TypeError):
            return Response(
                {'error': 'Valeur de stock invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def generer_recommandation(self, request, pk=None):
        """
        Génère une recommandation de réapprovisionnement si nécessaire
        """
        buffer = self.get_object()
        niveau = buffer.get_niveau_actuel()

        if niveau in ['ROUGE', 'JAUNE']:
            quantite_reappro = buffer.get_quantite_reappro_optimale()

                                                    
            priorite = 1 if niveau == 'ROUGE' else 2

                                     
            recommandation = Recommandation.objects.create(
                buffer=buffer,
                type_recommandation='REAPPRO',
                quantite=quantite_reappro,
                priorite=priorite,
                statut='EN_ATTENTE',
                justification=f"Niveau {niveau} détecté. Stock actuel: {buffer.stock_disponible}, "
                              f"Zone critique: {buffer.zone_rouge}"
            )

            serializer = RecommandationSerializer(recommandation)
            return Response({
                'recommandation': serializer.data,
                'message': f'Recommandation créée (niveau {niveau})'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'Aucune recommandation nécessaire (niveau VERT)',
                'niveau': niveau,
                'stock': float(buffer.stock_disponible)
            })

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Statistiques globales des buffers"""
        buffers = BufferDDMRP.objects.all()
        total = buffers.count()

        stats = {
            'total': total,
            'actifs': buffers.filter(actif=True).count(),
            'par_niveau': {
                'rouge': 0,
                'jaune': 0,
                'vert': 0
            }
        }

        for buffer in buffers:
            niveau = buffer.get_niveau_actuel().lower()
            stats['par_niveau'][niveau] = stats['par_niveau'].get(niveau, 0) + 1

        return Response(stats)

    @action(detail=False, methods=['post'])
    def recalculer_tous(self, request):
        """Recalcule toutes les zones de tous les buffers actifs"""
        buffers = BufferDDMRP.objects.filter(actif=True)
        count = 0

        for buffer in buffers:
            buffer.calculer_zones()
            buffer.save()
            count += 1

        return Response({
            'message': f'{count} buffer(s) recalculé(s)',
            'count': count
        })


class RecommandationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les Recommandations DDMRP
    """
    queryset = Recommandation.objects.select_related(
        'buffer__article', 'buffer__poste', 'ordre_fabrication'
    ).all()
    serializer_class = RecommandationSerializer

    def get_queryset(self):
        """Filtrage par statut, type et buffer"""
        queryset = super().get_queryset()
        statut = self.request.query_params.get('statut', None)
        type_reco = self.request.query_params.get('type', None)
        buffer_id = self.request.query_params.get('buffer', None)

        if statut:
            queryset = queryset.filter(statut=statut)
        if type_reco:
            queryset = queryset.filter(type_recommandation=type_reco)
        if buffer_id:
            queryset = queryset.filter(buffer_id=buffer_id)

        return queryset

    @action(detail=True, methods=['post'])
    def executer(self, request, pk=None):
        """
        Exécute la recommandation (crée un OF)
        """
        recommandation = self.get_object()

        if recommandation.statut != 'EN_ATTENTE':
            return Response(
                {'error': 'Seules les recommandations en attente peuvent être exécutées'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                ordre = recommandation.executer()

                serializer = self.get_serializer(recommandation)
                response_data = {
                    'recommandation': serializer.data,
                    'message': 'Recommandation exécutée'
                }

                if ordre:
                    from core.serializers import OrdreFabricationSerializer
                    response_data['ordre_cree'] = OrdreFabricationSerializer(ordre).data

                return Response(response_data)

        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def rejeter(self, request, pk=None):
        """Rejette la recommandation"""
        recommandation = self.get_object()

        if recommandation.statut != 'EN_ATTENTE':
            return Response(
                {'error': 'Seules les recommandations en attente peuvent être rejetées'},
                status=status.HTTP_400_BAD_REQUEST
            )

        recommandation.statut = 'REJETEE'
        recommandation.save()

        serializer = self.get_serializer(recommandation)
        return Response({
            'recommandation': serializer.data,
            'message': 'Recommandation rejetée'
        })

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Statistiques des recommandations"""
        recos = Recommandation.objects.all()

        stats = {
            'total': recos.count(),
            'par_statut': {},
            'par_type': {},
            'par_priorite': {}
        }

        for statut, label in Recommandation.STATUT_CHOICES:
            stats['par_statut'][statut] = recos.filter(statut=statut).count()

        for type_reco, label in Recommandation.TYPE_CHOICES:
            stats['par_type'][type_reco] = recos.filter(type_recommandation=type_reco).count()

        for priorite in range(1, 6):
            stats['par_priorite'][priorite] = recos.filter(priorite=priorite).count()

        return Response(stats)

    @action(detail=False, methods=['post'])
    def generer_automatiques(self, request):
        """
        Génère automatiquement des recommandations pour tous les buffers en zone rouge ou jaune
        """
        buffers = BufferDDMRP.objects.filter(actif=True)
        recommandations_creees = []

        for buffer in buffers:
            niveau = buffer.get_niveau_actuel()

            if niveau in ['ROUGE', 'JAUNE']:
                                                                             
                existe = Recommandation.objects.filter(
                    buffer=buffer,
                    statut='EN_ATTENTE'
                ).exists()

                if not existe:
                    quantite_reappro = buffer.get_quantite_reappro_optimale()
                    priorite = 1 if niveau == 'ROUGE' else 2

                    reco = Recommandation.objects.create(
                        buffer=buffer,
                        type_recommandation='REAPPRO',
                        quantite=quantite_reappro,
                        priorite=priorite,
                        statut='EN_ATTENTE',
                        justification=f"Génération automatique - Niveau {niveau}"
                    )
                    recommandations_creees.append(reco)

        serializer = self.get_serializer(recommandations_creees, many=True)
        return Response({
            'message': f'{len(recommandations_creees)} recommandation(s) créée(s)',
            'recommandations': serializer.data
        }, status=status.HTTP_201_CREATED)

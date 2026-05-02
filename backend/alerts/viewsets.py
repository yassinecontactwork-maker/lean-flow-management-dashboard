"""
ViewSets de l'application Alerts
""" 
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models                                       
from django.db.models import Count, Q
from .models import Alerte, Conflit
from .serializers import AlerteSerializer, ConflitSerializer, ResolutionConflitSerializer
class AlerteViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les Alertes
    """
    queryset = Alerte.objects.select_related('article', 'poste', 'ordre_fabrication').all()
    serializer_class = AlerteSerializer

    def get_queryset(self):
        """Filtrage par type, sévérité, statut"""
        queryset = super().get_queryset()
        type_alerte = self.request.query_params.get('type', None)
        severite = self.request.query_params.get('severite', None)
        statut = self.request.query_params.get('statut', None)

        if type_alerte:
            queryset = queryset.filter(type_alerte=type_alerte)
        if severite:
            queryset = queryset.filter(severite=severite)
        if statut:
            queryset = queryset.filter(statut=statut)

        return queryset

    @action(detail=True, methods=['post'])
    def resoudre(self, request, pk=None):
        """Marque l'alerte comme résolue"""
        alerte = self.get_object()
        alerte.resoudre()

        serializer = self.get_serializer(alerte)
        return Response({
            'alerte': serializer.data,
            'message': 'Alerte résolue'
        })

    @action(detail=True, methods=['post'])
    def ignorer(self, request, pk=None):
        """Marque l'alerte comme ignorée"""
        alerte = self.get_object()
        alerte.ignorer()

        serializer = self.get_serializer(alerte)
        return Response({
            'alerte': serializer.data,
            'message': 'Alerte ignorée'
        })

    @action(detail=False, methods=['get'])
    def actives(self, request):
        """Retourne uniquement les alertes actives"""
        alertes = self.get_queryset().filter(statut='ACTIVE')
        serializer = self.get_serializer(alertes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Statistiques des alertes"""
        alertes = Alerte.objects.all()

        stats = {
            'total': alertes.count(),
            'actives': alertes.filter(statut='ACTIVE').count(),
            'resolues': alertes.filter(statut='RESOLUE').count(),
            'ignorees': alertes.filter(statut='IGNOREE').count(),
            'par_type': {},
            'par_severite': {}
        }

        for type_alerte, label in Alerte.TYPE_CHOICES:
            stats['par_type'][type_alerte] = alertes.filter(type_alerte=type_alerte).count()

        for severite, label in Alerte.SEVERITE_CHOICES:
            stats['par_severite'][severite] = alertes.filter(severite=severite).count()

        return Response(stats)

    @action(detail=False, methods=['post'])
    def generer_automatiques(self, request):
        """Génère automatiquement des alertes basées sur l'état du système"""
        from core.models import Article, PosteTravail
        from kanban.models import CarteKanban
        from conwip.models import LigneProduction
        from ddmrp.models import BufferDDMRP

        alertes_creees = []

                                 
        articles_stock_bas = Article.objects.filter(
            stock_physique__lt=models.F('stock_securite')
        )
        for article in articles_stock_bas:
            alerte = Alerte.objects.create(
                type_alerte='STOCK_BAS',
                severite='HAUTE',
                message=f"Stock bas pour {article.sku}: {article.stock_physique} < {article.stock_securite}",
                article=article,
                details={
                    'stock_actuel': float(article.stock_physique),
                    'stock_securite': float(article.stock_securite)
                }
            )
            alertes_creees.append(alerte)

                                           
        cartes_vides = CarteKanban.objects.filter(statut='VIDE').count()
        if cartes_vides > 0:
            alerte = Alerte.objects.create(
                type_alerte='CARTES_VIDES',
                severite='MOYENNE',
                message=f"{cartes_vides} carte(s) Kanban vide(s) nécessitant un réapprovisionnement",
                details={'nombre_cartes_vides': cartes_vides}
            )
            alertes_creees.append(alerte)

                                     
        lignes_saturees = LigneProduction.objects.filter(active=True)
        for ligne in lignes_saturees:
            if ligne.est_saturee():
                alerte = Alerte.objects.create(
                    type_alerte='WIP_ELEVE',
                    severite='HAUTE',
                    message=f"WIP critique atteint pour la ligne {ligne.nom}: {ligne.get_wip_actuel()}/{ligne.wip_critique}",
                    details={
                        'ligne': ligne.nom,
                        'wip_actuel': ligne.get_wip_actuel(),
                        'wip_critique': ligne.wip_critique
                    }
                )
                alertes_creees.append(alerte)

                                           
        goulets = PosteTravail.objects.filter(est_goulet=True)
        for goulet in goulets:
            charge = goulet.ordres_fabrication.filter(statut='EN_COURS').count()
            if charge > 0:
                alerte = Alerte.objects.create(
                    type_alerte='GOULET',
                    severite='CRITIQUE',
                    message=f"Goulet d'étranglement {goulet.nom} avec {charge} OF en cours",
                    poste=goulet,
                    details={'charge_actuelle': charge}
                )
                alertes_creees.append(alerte)

                                                
        buffers_rouges = BufferDDMRP.objects.filter(actif=True)
        for buffer in buffers_rouges:
            if buffer.get_niveau_actuel() == 'ROUGE':
                alerte = Alerte.objects.create(
                    type_alerte='BUFFER_ROUGE',
                    severite='CRITIQUE',
                    message=f"Buffer DDMRP en zone rouge: {buffer.article.sku} @ {buffer.poste.nom}",
                    article=buffer.article,
                    poste=buffer.poste,
                    details={
                        'stock_actuel': float(buffer.stock_disponible),
                        'zone_rouge': float(buffer.zone_rouge)
                    }
                )
                alertes_creees.append(alerte)

        serializer = self.get_serializer(alertes_creees, many=True)
        return Response({
            'message': f'{len(alertes_creees)} alerte(s) générée(s)',
            'alertes': serializer.data
        }, status=status.HTTP_201_CREATED)


class ConflitViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les Conflits multi-signaux
    """
    queryset = Conflit.objects.select_related('article', 'poste').all()
    serializer_class = ConflitSerializer

    def get_queryset(self):
        """Filtrage par type et statut"""
        queryset = super().get_queryset()
        type_conflit = self.request.query_params.get('type', None)
        statut = self.request.query_params.get('statut', None)

        if type_conflit:
            queryset = queryset.filter(type_conflit=type_conflit)
        if statut:
            queryset = queryset.filter(statut=statut)

        return queryset

    @action(detail=True, methods=['post'])
    def resoudre(self, request, pk=None):
        """Résout le conflit selon une méthode choisie"""
        conflit = self.get_object()

        if conflit.statut != 'EN_ATTENTE':
            return Response(
                {'error': 'Seuls les conflits en attente peuvent être résolus'},
                status=status.HTTP_400_BAD_REQUEST
            )

        resolution_serializer = ResolutionConflitSerializer(data=request.data)
        if not resolution_serializer.is_valid():
            return Response(resolution_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            methode = resolution_serializer.validated_data['methode']
            decision = resolution_serializer.validated_data.get('decision', '')

            conflit.resoudre(methode, decision)

            serializer = self.get_serializer(conflit)
            return Response({
                'conflit': serializer.data,
                'message': f'Conflit résolu avec méthode {methode}'
            })

        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def en_attente(self, request):
        """Retourne uniquement les conflits en attente de décision"""
        conflits = self.get_queryset().filter(statut='EN_ATTENTE')
        serializer = self.get_serializer(conflits, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Statistiques des conflits"""
        conflits = Conflit.objects.all()

        stats = {
            'total': conflits.count(),
            'en_attente': conflits.filter(statut='EN_ATTENTE').count(),
            'resolus': conflits.exclude(statut__in=['EN_ATTENTE', 'IGNORE']).count(),
            'ignores': conflits.filter(statut='IGNORE').count(),
            'par_type': {}
        }

        for type_conflit, label in Conflit.TYPE_CHOICES:
            stats['par_type'][type_conflit] = conflits.filter(type_conflit=type_conflit).count()

        return Response(stats)

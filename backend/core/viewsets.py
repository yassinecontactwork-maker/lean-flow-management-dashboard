"""
ViewSets de l'application Core
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Article, PosteTravail, OrdreFabrication
from .serializers import ArticleSerializer, PosteTravailSerializer, OrdreFabricationSerializer


class ArticleViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les Articles
    """
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

    @action(detail=False, methods=['get'])
    def stock_faible(self, request):
        """Retourne les articles avec stock physique < stock de sécurité"""
        articles = Article.objects.filter(stock_physique__lt=models.F('stock_securite'))
        serializer = self.get_serializer(articles, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def ajuster_stock(self, request, pk=None):
        """Ajuste le stock physique d'un article"""
        article = self.get_object()
        quantite = request.data.get('quantite')
        
        if quantite is None:
            return Response(
                {'error': 'Le champ quantite est requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            quantite = float(quantite)
            article.stock_physique = quantite
            article.save()
            serializer = self.get_serializer(article)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {'error': 'La quantité doit être un nombre'},
                status=status.HTTP_400_BAD_REQUEST
            )


class PosteTravailViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les Postes de Travail
    """
    queryset = PosteTravail.objects.all()
    serializer_class = PosteTravailSerializer

    @action(detail=False, methods=['get'])
    def goulets(self, request):
        """Retourne uniquement les postes identifiés comme goulets"""
        postes = PosteTravail.objects.filter(est_goulet=True)
        serializer = self.get_serializer(postes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def charge_actuelle(self, request, pk=None):
        """Calcule la charge actuelle du poste (nombre d'OF en cours)"""
        poste = self.get_object()
        charge = OrdreFabrication.objects.filter(
            poste=poste,
            statut='EN_COURS'
        ).count()
        
        return Response({
            'poste_id': poste.id,
            'nom': poste.nom,
            'charge_actuelle': charge
        })


class OrdreFabricationViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les Ordres de Fabrication
    """
    queryset = OrdreFabrication.objects.select_related('article', 'poste').all()
    serializer_class = OrdreFabricationSerializer

    def get_queryset(self):
        """Filtrage optionnel par statut et poste"""
        queryset = super().get_queryset()
        statut = self.request.query_params.get('statut', None)
        poste_id = self.request.query_params.get('poste', None)
        source = self.request.query_params.get('source', None)
        
        if statut:
            queryset = queryset.filter(statut=statut)
        if poste_id:
            queryset = queryset.filter(poste_id=poste_id)
        if source:
            queryset = queryset.filter(source=source)
        
        return queryset

    @action(detail=False, methods=['get'])
    def statistiques(self, request):
        """Statistiques globales des OF"""
        stats = {
            'total': OrdreFabrication.objects.count(),
            'en_attente': OrdreFabrication.objects.filter(statut='EN_ATTENTE').count(),
            'en_cours': OrdreFabrication.objects.filter(statut='EN_COURS').count(),
            'termines': OrdreFabrication.objects.filter(statut='TERMINE').count(),
            'par_source': {}
        }
        
                                
        for source, label in OrdreFabrication.SOURCE_CHOICES:
            stats['par_source'][source] = OrdreFabrication.objects.filter(source=source).count()
        
        return Response(stats)

    @action(detail=True, methods=['post'])
    def demarrer(self, request, pk=None):
        """Démarre un ordre de fabrication"""
        ordre = self.get_object()
        
        if ordre.statut != 'EN_ATTENTE':
            return Response(
                {'error': 'Seuls les ordres en attente peuvent être démarrés'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.utils import timezone
        ordre.statut = 'EN_COURS'
        ordre.date_debut = timezone.now()
        ordre.save()
        
        serializer = self.get_serializer(ordre)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def terminer(self, request, pk=None):
        """Termine un ordre de fabrication"""
        ordre = self.get_object()
        
        if ordre.statut != 'EN_COURS':
            return Response(
                {'error': 'Seuls les ordres en cours peuvent être terminés'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.utils import timezone
        ordre.statut = 'TERMINE'
        ordre.date_fin = timezone.now()
        ordre.save()
        
                                                    
        ordre.article.stock_physique += ordre.quantite
        ordre.article.save()
        
        serializer = self.get_serializer(ordre)
        return Response(serializer.data)

"""
URL configuration for Lean Manufacturing application.
Router global unique - TOUS les viewsets sont enregistrés ici.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from core.views import csrf_token, current_user, login_view, logout_view, register


                             
from core.viewsets import ArticleViewSet, PosteTravailViewSet, OrdreFabricationViewSet
from kanban.viewsets import ConfigFluxKanbanViewSet, CarteKanbanViewSet
from conwip.viewsets import LigneProductionViewSet, TicketConwipViewSet
from ddmrp.viewsets import BufferDDMRPViewSet, RecommandationViewSet
from alerts.viewsets import AlerteViewSet, ConflitViewSet

                                                     
router = DefaultRouter()

                                  
router.register(r'articles', ArticleViewSet, basename='article')
router.register(r'postes-travail', PosteTravailViewSet, basename='poste-travail')
router.register(r'ordres-fabrication', OrdreFabricationViewSet, basename='ordre-fabrication')

                                    
router.register(r'config-flux-kanban', ConfigFluxKanbanViewSet, basename='config-flux-kanban')
router.register(r'cartes-kanban', CarteKanbanViewSet, basename='carte-kanban')

                                    
router.register(r'lignes-production', LigneProductionViewSet, basename='ligne-production')
router.register(r'tickets-conwip', TicketConwipViewSet, basename='ticket-conwip')

                                   
router.register(r'buffers-ddmrp', BufferDDMRPViewSet, basename='buffer-ddmrp')
router.register(r'recommandations', RecommandationViewSet, basename='recommandation')

                                    
router.register(r'alertes', AlerteViewSet, basename='alerte')
router.register(r'conflits', ConflitViewSet, basename='conflit')

urlpatterns = [
    path('admin/', admin.site.urls),
    
                   
    path('api/', include(router.urls)),
    
                                 
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/auth/register/', register),
    path('api/auth/login/', login_view),
    path('api/auth/logout/', logout_view),
    path('api/auth/user/', current_user),
    path('api/auth/csrf/', csrf_token),

                                              
    path('api/auth/', include('rest_framework.urls')),
]

                                            
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

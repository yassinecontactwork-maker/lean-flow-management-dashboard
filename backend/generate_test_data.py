                     
"""
Script de génération de données de test pour l'application Lean Manufacturing
"""

import os
import django
import random
from decimal import Decimal
from datetime import datetime, timedelta

                                                         
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

                    
from core.models import Article, PosteTravail, OrdreFabrication
from kanban.models import ConfigFluxKanban, CarteKanban
from conwip.models import LigneProduction, SequencePoste, TicketConwip
from ddmrp.models import BufferDDMRP, Recommandation
from alerts.models import Alerte, Conflit
def create_articles():
    """Crée des articles de test"""
    print("Création des articles...")
    articles_data = [
        {'sku': 'PCB-001', 'designation': 'Circuit imprimé principal', 'adu': 50, 'lead_time': 5, 'stock_physique': 200, 'stock_securite': 100, 'prix_unitaire': 15.50},
        {'sku': 'RES-100', 'designation': 'Résistance 100 Ohm', 'adu': 200, 'lead_time': 2, 'stock_physique': 5000, 'stock_securite': 1000, 'prix_unitaire': 0.10},
        {'sku': 'CAP-10', 'designation': 'Condensateur 10µF', 'adu': 150, 'lead_time': 3, 'stock_physique': 3000, 'stock_securite': 800, 'prix_unitaire': 0.25},
        {'sku': 'LED-BLU', 'designation': 'LED Bleue', 'adu': 80, 'lead_time': 4, 'stock_physique': 1000, 'stock_securite': 400, 'prix_unitaire': 0.50},
        {'sku': 'BOX-STD', 'designation': 'Boîtier standard', 'adu': 40, 'lead_time': 7, 'stock_physique': 150, 'stock_securite': 80, 'prix_unitaire': 5.00},
        {'sku': 'SW-001', 'designation': 'Interrupteur ON/OFF', 'adu': 60, 'lead_time': 3, 'stock_physique': 800, 'stock_securite': 300, 'prix_unitaire': 1.20},
        {'sku': 'WIRE-1M', 'designation': 'Câble 1 mètre', 'adu': 100, 'lead_time': 2, 'stock_physique': 2000, 'stock_securite': 500, 'prix_unitaire': 0.80},
        {'sku': 'CONN-USB', 'designation': 'Connecteur USB', 'adu': 45, 'lead_time': 6, 'stock_physique': 350, 'stock_securite': 150, 'prix_unitaire': 2.50},
    ]
    
    articles = []
    for data in articles_data:
        article, created = Article.objects.get_or_create(
            sku=data['sku'],
            defaults=data
        )
        articles.append(article)
        if created:
            print(f"  ✓ Article créé: {article.sku}")
    
    return articles

def create_postes():
    """Crée des postes de travail"""
    print("\nCréation des postes de travail...")
    postes_data = [
        {'nom': 'Découpe PCB', 'capacite_horaire': 20, 'est_goulet': False},
        {'nom': 'Soudure', 'capacite_horaire': 10, 'est_goulet': True},          
        {'nom': 'Assemblage', 'capacite_horaire': 15, 'est_goulet': False},
        {'nom': 'Test Qualité', 'capacite_horaire': 12, 'est_goulet': False},
        {'nom': 'Emballage', 'capacite_horaire': 25, 'est_goulet': False},
        {'nom': 'Magasin', 'capacite_horaire': 50, 'est_goulet': False},
    ]
    
    postes = []
    for data in postes_data:
        poste, created = PosteTravail.objects.get_or_create(
            nom=data['nom'],
            defaults=data
        )
        postes.append(poste)
        if created:
            print(f"  ✓ Poste créé: {poste.nom}")
    
    return postes

def create_ordres_fabrication(articles, postes):
    """Crée des ordres de fabrication"""
    print("\nCréation des ordres de fabrication...")
    
    statuts = ['EN_ATTENTE', 'EN_COURS', 'TERMINE']
    sources = ['KANBAN', 'CONWIP', 'DDMRP', 'MANUEL']
    
    for i in range(20):
        numero = f"OF-{datetime.now().year}-{i+1:05d}"
        article = random.choice(articles)
        poste = random.choice(postes[:3])                                   
        
        of, created = OrdreFabrication.objects.get_or_create(
            numero=numero,
            defaults={
                'article': article,
                'poste': poste,
                'quantite': random.randint(10, 100),
                'statut': random.choice(statuts),
                'priorite': random.randint(1, 5),
                'source': random.choice(sources),
            }
        )
        if created:
            print(f"  ✓ OF créé: {of.numero}")

def create_kanban_config(articles, postes):
    """Crée des configurations de flux Kanban"""
    print("\nCréation des configurations Kanban...")
    
                                
    flux_configs = [
        (articles[0], postes[0], postes[1], 50, 2, 20),                          
        (articles[1], postes[5], postes[1], 200, 1, 100),                                 
        (articles[2], postes[5], postes[1], 150, 1.5, 50),                                   
        (articles[3], postes[2], postes[3], 80, 2, 40),                          
    ]
    
    flux_list = []
    for article, fournisseur, consommateur, demande, lt, capacite in flux_configs:
        flux, created = ConfigFluxKanban.objects.get_or_create(
            article=article,
            poste_fournisseur=fournisseur,
            poste_consommateur=consommateur,
            defaults={
                'demande_moyenne': demande,
                'lead_time_jours': lt,
                'capacite_conteneur': capacite,
                'actif': True,
            }
        )
        flux_list.append(flux)
        if created:
            print(f"  ✓ Flux Kanban créé: {flux}")
            
                                           
            for j in range(flux.nombre_cartes_optimal):
                carte = CarteKanban.objects.create(
                    flux=flux,
                    statut='PLEIN' if random.random() > 0.3 else 'VIDE',
                    quantite=flux.capacite_conteneur if random.random() > 0.3 else 0,
                )
                if j < 2:                                      
                    print(f"    ✓ Carte créée: {carte.code_unique}")

def create_conwip(postes):
    """Crée des lignes CONWIP"""
    print("\nCréation des lignes CONWIP...")
    
                                    
    ligne, created = LigneProduction.objects.get_or_create(
        nom='Ligne Principale',
        defaults={
            'description': 'Ligne de production principale pour électronique',
            'wip_critique': 5,
            'active': True,
        }
    )
    
    if created:
        print(f"  ✓ Ligne créée: {ligne.nom}")
        
                                       
        for i, poste in enumerate(postes[:4], start=1):
            SequencePoste.objects.create(
                ligne=ligne,
                poste=poste,
                ordre=i
            )
            print(f"    ✓ Poste {i}: {poste.nom}")
        
                           
        for i in range(ligne.wip_critique):
            ticket = TicketConwip.objects.create(
                ligne=ligne,
                numero=f"CONWIP-{ligne.nom}-{i+1:04d}",
                statut='LIBRE',
            )
            print(f"    ✓ Ticket créé: {ticket.numero}")

def create_ddmrp(articles, postes):
    """Crée des buffers DDMRP"""
    print("\nCréation des buffers DDMRP...")
    
                                                   
    for i in range(min(5, len(articles))):
        article = articles[i]
        poste = postes[i % len(postes)]
        
        buffer, created = BufferDDMRP.objects.get_or_create(
            article=article,
            poste=poste,
            defaults={
                'adu': article.adu,
                'lead_time_jours': article.lead_time,
                'facteur_lead_time': Decimal('0.5'),
                'facteur_variabilite': Decimal('0.5'),
                'stock_minimum_commande': Decimal('50'),
                'stock_disponible': article.stock_physique,
                'actif': True,
            }
        )
        
        if created:
            print(f"  ✓ Buffer créé: {buffer}")
            
                                                                 
            if buffer.get_niveau_actuel() in ['ROUGE', 'JAUNE']:
                reco = Recommandation.objects.create(
                    buffer=buffer,
                    type_recommandation='REAPPRO',
                    quantite=buffer.get_quantite_reappro_optimale(),
                    priorite=1 if buffer.get_niveau_actuel() == 'ROUGE' else 2,
                    statut='EN_ATTENTE',
                    justification=f"Niveau {buffer.get_niveau_actuel()} détecté"
                )
                print(f"    ✓ Recommandation créée: {reco}")

def create_alertes(articles, postes):
    """Crée des alertes"""
    print("\nCréation des alertes...")
    
    alertes_data = [
        {
            'type_alerte': 'STOCK_BAS',
            'severite': 'HAUTE',
            'message': f'Stock critique pour {articles[0].sku}',
            'article': articles[0],
        },
        {
            'type_alerte': 'GOULET',
            'severite': 'CRITIQUE',
            'message': f'Goulet détecté sur {postes[1].nom}',
            'poste': postes[1],
        },
        {
            'type_alerte': 'CARTES_VIDES',
            'severite': 'MOYENNE',
            'message': '3 cartes Kanban vides nécessitant réapprovisionnement',
        },
    ]
    
    for data in alertes_data:
        alerte = Alerte.objects.create(**data, statut='ACTIVE')
        print(f"  ✓ Alerte créée: {alerte}")

def create_conflits(articles, postes):
    """Crée des conflits"""
    print("\nCréation des conflits...")
    
    conflit = Conflit.objects.create(
        type_conflit='KANBAN_CONWIP',
        description=f"Conflit détecté: Kanban demande production de {articles[0].sku} mais CONWIP saturé",
        priorite=1,
        article=articles[0],
        poste=postes[1],
        statut='EN_ATTENTE',
        signal_kanban={'cartes_vides': 2, 'demande_reappro': True},
        signal_conwip={'wip_actuel': 5, 'wip_critique': 5, 'saturee': True},
    )
    print(f"  ✓ Conflit créé: {conflit}")

def main():
    """Fonction principale"""
    print("="*60)
    print("GÉNÉRATION DE DONNÉES DE TEST - LEAN MANUFACTURING")
    print("="*60)
    
                                  
    articles = create_articles()
    postes = create_postes()
    
                         
    create_ordres_fabrication(articles, postes)
    
                     
    create_kanban_config(articles, postes)
    
                     
    create_conwip(postes)
    
                    
    create_ddmrp(articles, postes)
    
                                  
    create_alertes(articles, postes)
    create_conflits(articles, postes)
    
    print("\n" + "="*60)
    print("✓ GÉNÉRATION TERMINÉE AVEC SUCCÈS!")
    print("="*60)
    print("\nStatistiques:")
    print(f"  Articles: {Article.objects.count()}")
    print(f"  Postes de travail: {PosteTravail.objects.count()}")
    print(f"  Ordres de fabrication: {OrdreFabrication.objects.count()}")
    print(f"  Config flux Kanban: {ConfigFluxKanban.objects.count()}")
    print(f"  Cartes Kanban: {CarteKanban.objects.count()}")
    print(f"  Lignes CONWIP: {LigneProduction.objects.count()}")
    print(f"  Tickets CONWIP: {TicketConwip.objects.count()}")
    print(f"  Buffers DDMRP: {BufferDDMRP.objects.count()}")
    print(f"  Recommandations: {Recommandation.objects.count()}")
    print(f"  Alertes: {Alerte.objects.count()}")
    print(f"  Conflits: {Conflit.objects.count()}")
    print("\nVous pouvez maintenant lancer l'application!")

if __name__ == '__main__':
    main()

"""
Models de l'application DDMRP (Demand Driven Material Requirements Planning)
"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
import math


class BufferDDMRP(models.Model):
    """
    Buffer DDMRP avec zones rouge/jaune/verte calculées automatiquement.
    """
    article = models.ForeignKey(
        'core.Article',
        on_delete=models.CASCADE,
        related_name='buffers_ddmrp',
        verbose_name="Article"
    )
    poste = models.ForeignKey(
        'core.PosteTravail',
        on_delete=models.CASCADE,
        related_name='buffers_ddmrp',
        verbose_name="Poste de travail"
    )
    adu = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="ADU (Average Daily Usage)",
        help_text="Consommation quotidienne moyenne"
    )
    lead_time_jours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Lead Time (jours)"
    )
    facteur_lead_time = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.5,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Facteur Lead Time",
        help_text="Multiplicateur du lead time (généralement 0.5)"
    )
    facteur_variabilite = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.5,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Facteur Variabilité",
        help_text="Facteur de variabilité de la demande (0.0 à 1.0)"
    )
    stock_minimum_commande = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="MOQ (Minimum Order Quantity)"
    )

                                     
    zone_rouge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Zone Rouge (seuil critique)"
    )
    zone_jaune = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Zone Jaune (seuil alerte)"
    )
    zone_verte = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Zone Verte (niveau optimal)"
    )

    stock_disponible = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Stock disponible"
    )

    actif = models.BooleanField(default=True, verbose_name="Buffer actif")
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    date_dernier_calcul = models.DateTimeField(null=True, blank=True, verbose_name="Date dernier calcul")

    class Meta:
        ordering = ['article__sku']
        verbose_name = "Buffer DDMRP"
        verbose_name_plural = "Buffers DDMRP"
        unique_together = ['article', 'poste']

    def __str__(self):
        return f"Buffer {self.article.sku} @ {self.poste.nom}"

    def calculer_zones(self):
        """
        Calcule les zones rouge, jaune et verte selon la méthode DDMRP.
        Zone Rouge = (ADU × Lead Time × Facteur LT) + Stock Sécurité
        Zone Jaune = ADU × Lead Time
        Zone Verte = Zone Jaune × Facteur Variabilité + MOQ
        """
        from django.utils import timezone

        adu_float = float(self.adu)
        lt_float = float(self.lead_time_jours)
        facteur_lt = float(self.facteur_lead_time)
        facteur_var = float(self.facteur_variabilite)
        moq = float(self.stock_minimum_commande)

                                                             
        self.zone_rouge = Decimal(adu_float * lt_float * facteur_lt)

                                             
        self.zone_jaune = Decimal(adu_float * lt_float)

                                                         
        self.zone_verte = Decimal((adu_float * lt_float * facteur_var) + moq)

        self.date_dernier_calcul = timezone.now()

    def get_niveau_actuel(self):
        """Retourne le niveau actuel: ROUGE, JAUNE ou VERT"""
        stock = float(self.stock_disponible)
        if stock <= float(self.zone_rouge):
            return 'ROUGE'
        elif stock <= float(self.zone_rouge + self.zone_jaune):
            return 'JAUNE'
        else:
            return 'VERT'

    def get_quantite_reappro_optimale(self):
        """Calcule la quantité de réapprovisionnement optimale"""
        niveau_cible = float(self.zone_rouge + self.zone_jaune + self.zone_verte)
        stock_actuel = float(self.stock_disponible)
        quantite = max(0, niveau_cible - stock_actuel)

                          
        if quantite > 0 and quantite < float(self.stock_minimum_commande):
            quantite = float(self.stock_minimum_commande)

        return Decimal(quantite)

    def save(self, *args, **kwargs):
        """Recalcul automatique des zones avant sauvegarde"""
        self.calculer_zones()
        super().save(*args, **kwargs)


class Recommandation(models.Model):
    """
    Recommandation générée automatiquement par le système DDMRP.
    """
    TYPE_CHOICES = [
        ('REAPPRO', 'Réapprovisionnement'),
        ('ACCELERER', 'Accélérer production'),
        ('RALENTIR', 'Ralentir production'),
        ('ANNULER', 'Annuler commande'),
    ]

    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('VALIDEE', 'Validée'),
        ('EXECUTEE', 'Exécutée'),
        ('REJETEE', 'Rejetée'),
    ]

    buffer = models.ForeignKey(
        BufferDDMRP,
        on_delete=models.CASCADE,
        related_name='recommandations',
        verbose_name="Buffer DDMRP"
    )
    type_recommandation = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        verbose_name="Type de recommandation"
    )
    quantite = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Quantité recommandée"
    )
    priorite = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1)],
        verbose_name="Priorité (1=max, 5=min)"
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_ATTENTE',
        verbose_name="Statut"
    )
    justification = models.TextField(
        blank=True,
        verbose_name="Justification",
        help_text="Explication de la recommandation"
    )
    ordre_fabrication = models.ForeignKey(
        'core.OrdreFabrication',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='recommandations_ddmrp',
        verbose_name="Ordre de fabrication créé"
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_execution = models.DateTimeField(null=True, blank=True, verbose_name="Date d'exécution")

    class Meta:
        ordering = ['priorite', '-date_creation']
        verbose_name = "Recommandation DDMRP"
        verbose_name_plural = "Recommandations DDMRP"

    def __str__(self):
        return f"{self.get_type_recommandation_display()} - {self.buffer.article.sku} (P{self.priorite})"

    def executer(self):
        """Exécute la recommandation (création d'OF)"""
        from django.utils import timezone
        from core.models import OrdreFabrication
        from datetime import datetime

        if self.statut != 'EN_ATTENTE':
            raise ValueError("Seules les recommandations en attente peuvent être exécutées")

        if self.type_recommandation == 'REAPPRO':
                         
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            numero_of = f"OF-DDMRP-{self.buffer.article.sku}-{timestamp}"

            ordre = OrdreFabrication.objects.create(
                numero=numero_of,
                article=self.buffer.article,
                poste=self.buffer.poste,
                quantite=self.quantite,
                statut='EN_ATTENTE',
                priorite=self.priorite,
                source='DDMRP'
            )

            self.ordre_fabrication = ordre
            self.statut = 'EXECUTEE'
            self.date_execution = timezone.now()
            self.save()

            return ordre
        else:
                                                                     
            self.statut = 'VALIDEE'
            self.save()
            return None

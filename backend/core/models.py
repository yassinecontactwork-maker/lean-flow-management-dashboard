"""
Models de l'application Core - Entités de base de la gestion Lean Manufacturing
"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Article(models.Model):
    """
    Article (produit/composant) géré dans le système.
    """
    sku = models.CharField(max_length=50, unique=True, verbose_name="SKU")
    designation = models.CharField(max_length=200, verbose_name="Désignation")
    adu = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="ADU (Average Daily Usage)",
        help_text="Consommation quotidienne moyenne"
    )
    lead_time = models.IntegerField(
        validators=[MinValueValidator(0)],
        verbose_name="Lead Time (jours)",
        help_text="Délai d'approvisionnement ou de fabrication"
    )
    stock_physique = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        default=0,
        verbose_name="Stock physique"
    )
    stock_securite = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        default=0,
        verbose_name="Stock de sécurité"
    )
    prix_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        default=0,
        verbose_name="Prix unitaire"
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sku']
        verbose_name = "Article"
        verbose_name_plural = "Articles"

    def __str__(self):
        return f"{self.sku} - {self.designation}"


class PosteTravail(models.Model):
    """
    Poste de travail (machine, zone de production).
    """
    nom = models.CharField(max_length=100, unique=True, verbose_name="Nom du poste")
    capacite_horaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Capacité horaire",
        help_text="Nombre d'unités produites par heure"
    )
    est_goulet = models.BooleanField(
        default=False,
        verbose_name="Goulet d'étranglement",
        help_text="Cocher si ce poste est identifié comme goulet"
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nom']
        verbose_name = "Poste de travail"
        verbose_name_plural = "Postes de travail"

    def __str__(self):
        return f"{self.nom} {'(GOULET)' if self.est_goulet else ''}"


class OrdreFabrication(models.Model):
    """
    Ordre de fabrication (OF) généré par les différents systèmes de pilotage.
    """
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('EN_COURS', 'En cours'),
        ('TERMINE', 'Terminé'),
        ('ANNULE', 'Annulé'),
    ]

    PRIORITE_CHOICES = [
        (1, 'Très haute'),
        (2, 'Haute'),
        (3, 'Normale'),
        (4, 'Basse'),
        (5, 'Très basse'),
    ]

    SOURCE_CHOICES = [
        ('KANBAN', 'Kanban'),
        ('CONWIP', 'CONWIP'),
        ('DDMRP', 'DDMRP'),
        ('MANUEL', 'Manuel'),
    ]

    numero = models.CharField(max_length=50, unique=True, verbose_name="Numéro OF")
    article = models.ForeignKey(
        Article,
        on_delete=models.CASCADE,
        related_name='ordres_fabrication',
        verbose_name="Article"
    )
    poste = models.ForeignKey(
        PosteTravail,
        on_delete=models.CASCADE,
        related_name='ordres_fabrication',
        verbose_name="Poste de travail"
    )
    quantite = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        verbose_name="Quantité"
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_ATTENTE',
        verbose_name="Statut"
    )
    priorite = models.IntegerField(
        choices=PRIORITE_CHOICES,
        default=3,
        verbose_name="Priorité"
    )
    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default='MANUEL',
        verbose_name="Source de création"
    )
    date_creation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    date_debut = models.DateTimeField(null=True, blank=True, verbose_name="Date de début")
    date_fin = models.DateTimeField(null=True, blank=True, verbose_name="Date de fin")
    date_livraison_prevue = models.DateField(null=True, blank=True, verbose_name="Date de livraison prévue")

    class Meta:
        ordering = ['-priorite', '-date_creation']
        verbose_name = "Ordre de fabrication"
        verbose_name_plural = "Ordres de fabrication"

    def __str__(self):
        return f"OF {self.numero} - {self.article.sku}"

"""
Models de l'application Kanban
"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
import qrcode
from io import BytesIO
from django.core.files import File
import math


class ConfigFluxKanban(models.Model):
    """
    Configuration d'un flux Kanban entre deux postes de travail.
    Le calcul du nombre de cartes optimal est automatique.
    """
    article = models.ForeignKey(
        'core.Article',
        on_delete=models.CASCADE,
        related_name='flux_kanban',
        verbose_name="Article"
    )
    poste_fournisseur = models.ForeignKey(
        'core.PosteTravail',
        on_delete=models.CASCADE,
        related_name='flux_kanban_fournis',
        verbose_name="Poste fournisseur"
    )
    poste_consommateur = models.ForeignKey(
        'core.PosteTravail',
        on_delete=models.CASCADE,
        related_name='flux_kanban_consommes',
        verbose_name="Poste consommateur"
    )
    demande_moyenne = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Demande moyenne (unités/jour)",
        help_text="Demande quotidienne moyenne du poste consommateur"
    )
    lead_time_jours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0'))],
        verbose_name="Lead Time (jours)",
        help_text="Temps de réapprovisionnement"
    )
    capacite_conteneur = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Capacité du conteneur",
        help_text="Nombre d'unités par carte Kanban"
    )
    nombre_cartes_optimal = models.IntegerField(
        default=0,
        verbose_name="Nombre de cartes optimal",
        help_text="Calculé automatiquement"
    )
    actif = models.BooleanField(default=True, verbose_name="Flux actif")
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['article__sku']
        verbose_name = "Configuration Flux Kanban"
        verbose_name_plural = "Configurations Flux Kanban"
        unique_together = ['article', 'poste_fournisseur', 'poste_consommateur']

    def __str__(self):
        return f"Flux {self.article.sku}: {self.poste_fournisseur.nom} → {self.poste_consommateur.nom}"

    def calculer_nombre_cartes_optimal(self):
        """
        Calcule le nombre de cartes Kanban optimal selon la formule :
        Nombre de cartes = (Demande moyenne × Lead Time) / Capacité conteneur
        Arrondi à l'entier supérieur + facteur de sécurité de 10%
        """
        if self.capacite_conteneur > 0:
            besoin = float(self.demande_moyenne) * float(self.lead_time_jours)
            nombre_base = besoin / self.capacite_conteneur
                                                   
            nombre_avec_securite = nombre_base * 1.1
            self.nombre_cartes_optimal = math.ceil(nombre_avec_securite)
        else:
            self.nombre_cartes_optimal = 0

    def save(self, *args, **kwargs):
        """Calcul automatique du nombre de cartes optimal avant sauvegarde"""
        self.calculer_nombre_cartes_optimal()
        super().save(*args, **kwargs)


class CarteKanban(models.Model):
    """
    Carte Kanban physique avec QR code.
    """
    STATUT_CHOICES = [
        ('PLEIN', 'Plein'),
        ('VIDE', 'Vide'),
    ]

    flux = models.ForeignKey(
        ConfigFluxKanban,
        on_delete=models.CASCADE,
        related_name='cartes',
        verbose_name="Flux Kanban"
    )
    code_unique = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Code unique",
        help_text="Code unique de la carte (généré automatiquement)"
    )
    statut = models.CharField(
        max_length=10,
        choices=STATUT_CHOICES,
        default='PLEIN',
        verbose_name="Statut"
    )
    quantite = models.IntegerField(
        validators=[MinValueValidator(0)],
        verbose_name="Quantité actuelle"
    )
    qr_code = models.ImageField(
        upload_to='kanban_qrcodes/',
        blank=True,
        null=True,
        verbose_name="QR Code"
    )
    ordre_fabrication = models.ForeignKey(
        'core.OrdreFabrication',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cartes_kanban',
        verbose_name="Ordre de fabrication associé"
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_dernier_scan = models.DateTimeField(null=True, blank=True, verbose_name="Date dernier scan")

    class Meta:
        ordering = ['-date_dernier_scan']
        verbose_name = "Carte Kanban"
        verbose_name_plural = "Cartes Kanban"

    def __str__(self):
        return f"Carte {self.code_unique} - {self.statut}"

    def generer_qr_code(self):
        """Génère le QR code de la carte"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(self.code_unique)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        file_name = f'kanban_{self.code_unique}.png'
        self.qr_code.save(file_name, File(buffer), save=False)
        buffer.close()

    def save(self, *args, **kwargs):
        """Génération automatique du code unique et du QR code"""
        if not self.code_unique:
                                                                         
            count = CarteKanban.objects.filter(flux=self.flux).count() + 1
            self.code_unique = f"K-{self.flux.article.sku}-{self.flux.id}-{count:04d}"
        
        if not self.quantite:
            self.quantite = self.flux.capacite_conteneur
        
        super().save(*args, **kwargs)
        
                                                
        if not self.qr_code:
            self.generer_qr_code()
            super().save(update_fields=['qr_code'])

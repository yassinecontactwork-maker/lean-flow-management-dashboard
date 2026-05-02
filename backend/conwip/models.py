"""
Models de l'application CONWIP (Constant Work In Process)
"""
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class LigneProduction(models.Model):
    """
    Ligne de production avec séquence de postes de travail.
    """
    nom = models.CharField(max_length=100, unique=True, verbose_name="Nom de la ligne")
    description = models.TextField(blank=True, verbose_name="Description")
    postes_sequence = models.ManyToManyField(
        'core.PosteTravail',
        through='SequencePoste',
        related_name='lignes_production',
        verbose_name="Postes de travail"
    )
    wip_critique = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="WIP critique",
        help_text="Nombre maximum de tickets CONWIP autorisés dans la ligne"
    )
    active = models.BooleanField(default=True, verbose_name="Ligne active")
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nom']
        verbose_name = "Ligne de production"
        verbose_name_plural = "Lignes de production"

    def __str__(self):
        return self.nom

    def get_wip_actuel(self):
        """Calcule le WIP actuel (tickets en circulation)"""
        return self.tickets_conwip.filter(statut__in=['EN_ATTENTE', 'EN_COURS']).count()

    def est_saturee(self):
        """Vérifie si la ligne a atteint son WIP critique"""
        return self.get_wip_actuel() >= self.wip_critique

    def get_goulet(self):
        """Identifie le poste goulet dans la séquence"""
        postes = self.sequenceposte_set.select_related('poste').order_by('ordre')
        for seq in postes:
            if seq.poste.est_goulet:
                return seq.poste
        return None


class SequencePoste(models.Model):
    """
    Séquence ordonnée des postes de travail dans une ligne de production.
    """
    ligne = models.ForeignKey(
        LigneProduction,
        on_delete=models.CASCADE,
        verbose_name="Ligne de production"
    )
    poste = models.ForeignKey(
        'core.PosteTravail',
        on_delete=models.CASCADE,
        verbose_name="Poste de travail"
    )
    ordre = models.IntegerField(
        validators=[MinValueValidator(1)],
        verbose_name="Ordre dans la séquence"
    )

    class Meta:
        ordering = ['ligne', 'ordre']
        unique_together = ['ligne', 'ordre']
        verbose_name = "Séquence de poste"
        verbose_name_plural = "Séquences de postes"

    def __str__(self):
        return f"{self.ligne.nom} - Étape {self.ordre}: {self.poste.nom}"


class TicketConwip(models.Model):
    """
    Ticket CONWIP circulant dans une ligne de production.
    """
    STATUT_CHOICES = [
        ('LIBRE', 'Libre'),
        ('EN_ATTENTE', 'En attente'),
        ('EN_COURS', 'En cours'),
    ]

    ligne = models.ForeignKey(
        LigneProduction,
        on_delete=models.CASCADE,
        related_name='tickets_conwip',
        verbose_name="Ligne de production"
    )
    numero = models.CharField(max_length=50, unique=True, verbose_name="Numéro du ticket")
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='LIBRE',
        verbose_name="Statut"
    )
    ordre_fabrication = models.ForeignKey(
        'core.OrdreFabrication',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets_conwip',
        verbose_name="Ordre de fabrication"
    )
    poste_actuel = models.ForeignKey(
        'core.PosteTravail',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets_conwip_actuels',
        verbose_name="Poste actuel"
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_liberation = models.DateTimeField(null=True, blank=True, verbose_name="Date de libération")
    date_attribution = models.DateTimeField(null=True, blank=True, verbose_name="Date d'attribution")

    class Meta:
        ordering = ['-date_attribution']
        verbose_name = "Ticket CONWIP"
        verbose_name_plural = "Tickets CONWIP"

    def __str__(self):
        return f"Ticket {self.numero} - {self.statut}"

    def liberer(self):
        """Libère le ticket (fin d'un OF)"""
        from django.utils import timezone
        self.statut = 'LIBRE'
        self.ordre_fabrication = None
        self.poste_actuel = None
        self.date_liberation = timezone.now()
        self.save()

    def attribuer(self, ordre_fabrication, poste_depart):
        """Attribue le ticket à un OF"""
        from django.utils import timezone
        self.statut = 'EN_ATTENTE'
        self.ordre_fabrication = ordre_fabrication
        self.poste_actuel = poste_depart
        self.date_attribution = timezone.now()
        self.save()

    def demarrer(self):
        """Démarre le traitement (passage en EN_COURS)"""
        if self.statut == 'EN_ATTENTE':
            self.statut = 'EN_COURS'
            self.save()

    def avancer_poste(self, prochain_poste):
        """Fait avancer le ticket au poste suivant"""
        self.poste_actuel = prochain_poste
        self.save()

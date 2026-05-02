"""
Models de l'application Alerts - Alertes et Conflits multi-signaux
"""
from django.db import models
from django.core.validators import MinValueValidator


class Alerte(models.Model):
    """
    Alerte générée automatiquement par le système.
    """
    TYPE_CHOICES = [
        ('STOCK_BAS', 'Stock bas'),
        ('WIP_ELEVE', 'WIP élevé'),
        ('CARTES_VIDES', 'Cartes Kanban vides'),
        ('GOULET', 'Goulet d\'étranglement'),
        ('BUFFER_ROUGE', 'Buffer DDMRP en zone rouge'),
        ('RETARD_OF', 'Retard ordre de fabrication'),
    ]

    SEVERITE_CHOICES = [
        ('CRITIQUE', 'Critique'),
        ('HAUTE', 'Haute'),
        ('MOYENNE', 'Moyenne'),
        ('BASSE', 'Basse'),
    ]

    STATUT_CHOICES = [
        ('ACTIVE', 'Active'),
        ('RESOLUE', 'Résolue'),
        ('IGNOREE', 'Ignorée'),
    ]

    type_alerte = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        verbose_name="Type d'alerte"
    )
    severite = models.CharField(
        max_length=20,
        choices=SEVERITE_CHOICES,
        default='MOYENNE',
        verbose_name="Sévérité"
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='ACTIVE',
        verbose_name="Statut"
    )
    message = models.TextField(verbose_name="Message")
    details = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Détails",
        help_text="Informations complémentaires en JSON"
    )
    
                                             
    article = models.ForeignKey(
        'core.Article',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='alertes',
        verbose_name="Article concerné"
    )
    poste = models.ForeignKey(
        'core.PosteTravail',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='alertes',
        verbose_name="Poste concerné"
    )
    ordre_fabrication = models.ForeignKey(
        'core.OrdreFabrication',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='alertes',
        verbose_name="OF concerné"
    )

    date_creation = models.DateTimeField(auto_now_add=True, verbose_name="Date de création")
    date_resolution = models.DateTimeField(null=True, blank=True, verbose_name="Date de résolution")

    class Meta:
        ordering = ['-date_creation']
        verbose_name = "Alerte"
        verbose_name_plural = "Alertes"

    def __str__(self):
        return f"{self.get_type_alerte_display()} - {self.severite} ({self.statut})"

    def _changer_statut(self, nouveau_statut):
        """Helper method to change status and update resolution date"""
        from django.utils import timezone
        self.statut = nouveau_statut
        self.date_resolution = timezone.now()
        self.save()

    def resoudre(self):
        """Marque l'alerte comme résolue"""
        self._changer_statut('RESOLUE')

    def ignorer(self):
        """Marque l'alerte comme ignorée"""
        self._changer_statut('IGNOREE')


class Conflit(models.Model):
    """
    Conflit détecté entre plusieurs signaux de pilotage (Kanban, CONWIP, DDMRP).
    """
    TYPE_CHOICES = [
        ('KANBAN_CONWIP', 'Conflit Kanban / CONWIP'),
        ('KANBAN_DDMRP', 'Conflit Kanban / DDMRP'),
        ('CONWIP_DDMRP', 'Conflit CONWIP / DDMRP'),
        ('MULTI', 'Conflit multi-signaux'),
    ]

    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente de décision'),
        ('RESOLU_KANBAN', 'Résolu - Priorité Kanban'),
        ('RESOLU_CONWIP', 'Résolu - Priorité CONWIP'),
        ('RESOLU_DDMRP', 'Résolu - Priorité DDMRP'),
        ('RESOLU_MANUEL', 'Résolu - Décision manuelle'),
        ('IGNORE', 'Ignoré'),
    ]

    type_conflit = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        verbose_name="Type de conflit"
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='EN_ATTENTE',
        verbose_name="Statut"
    )
    description = models.TextField(verbose_name="Description du conflit")
    priorite = models.IntegerField(
        default=3,
        validators=[MinValueValidator(1)],
        verbose_name="Priorité (1=max, 5=min)"
    )

                        
    article = models.ForeignKey(
        'core.Article',
        on_delete=models.CASCADE,
        related_name='conflits',
        verbose_name="Article concerné"
    )
    poste = models.ForeignKey(
        'core.PosteTravail',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='conflits',
        verbose_name="Poste concerné"
    )

                        
    signal_kanban = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Signal Kanban",
        help_text="Données du signal Kanban"
    )
    signal_conwip = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Signal CONWIP",
        help_text="Données du signal CONWIP"
    )
    signal_ddmrp = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Signal DDMRP",
        help_text="Données du signal DDMRP"
    )

    decision = models.TextField(
        blank=True,
        verbose_name="Décision prise",
        help_text="Explication de la décision de résolution"
    )

    date_creation = models.DateTimeField(auto_now_add=True, verbose_name="Date de détection")
    date_resolution = models.DateTimeField(null=True, blank=True, verbose_name="Date de résolution")

    class Meta:
        ordering = ['priorite', '-date_creation']
        verbose_name = "Conflit"
        verbose_name_plural = "Conflits"

    def __str__(self):
        return f"{self.get_type_conflit_display()} - {self.article.sku} (P{self.priorite})"

    def resoudre(self, methode_resolution, decision_texte=""):
        """Résout le conflit selon une méthode choisie"""
        from django.utils import timezone

        if methode_resolution not in ['KANBAN', 'CONWIP', 'DDMRP', 'MANUEL']:
            raise ValueError("Méthode de résolution invalide")

        self.statut = f'RESOLU_{methode_resolution}'
        self.decision = decision_texte or f"Résolu avec priorité {methode_resolution}"
        self.date_resolution = timezone.now()
        self.save()

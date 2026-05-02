                                               

import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sku', models.CharField(max_length=50, unique=True, verbose_name='SKU')),
                ('designation', models.CharField(max_length=200, verbose_name='Désignation')),
                ('adu', models.DecimalField(decimal_places=2, help_text='Consommation quotidienne moyenne', max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='ADU (Average Daily Usage)')),
                ('lead_time', models.IntegerField(help_text="Délai d'approvisionnement ou de fabrication", validators=[django.core.validators.MinValueValidator(0)], verbose_name='Lead Time (jours)')),
                ('stock_physique', models.DecimalField(decimal_places=2, default=0, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Stock physique')),
                ('stock_securite', models.DecimalField(decimal_places=2, default=0, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Stock de sécurité')),
                ('prix_unitaire', models.DecimalField(decimal_places=2, default=0, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Prix unitaire')),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('date_modification', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Article',
                'verbose_name_plural': 'Articles',
                'ordering': ['sku'],
            },
        ),
        migrations.CreateModel(
            name='PosteTravail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=100, unique=True, verbose_name='Nom du poste')),
                ('capacite_horaire', models.DecimalField(decimal_places=2, help_text="Nombre d'unités produites par heure", max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Capacité horaire')),
                ('est_goulet', models.BooleanField(default=False, help_text='Cocher si ce poste est identifié comme goulet', verbose_name="Goulet d'étranglement")),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('date_modification', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Poste de travail',
                'verbose_name_plural': 'Postes de travail',
                'ordering': ['nom'],
            },
        ),
        migrations.CreateModel(
            name='OrdreFabrication',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('numero', models.CharField(max_length=50, unique=True, verbose_name='Numéro OF')),
                ('quantite', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0.01'))], verbose_name='Quantité')),
                ('statut', models.CharField(choices=[('EN_ATTENTE', 'En attente'), ('EN_COURS', 'En cours'), ('TERMINE', 'Terminé'), ('ANNULE', 'Annulé')], default='EN_ATTENTE', max_length=20, verbose_name='Statut')),
                ('priorite', models.IntegerField(choices=[(1, 'Très haute'), (2, 'Haute'), (3, 'Normale'), (4, 'Basse'), (5, 'Très basse')], default=3, verbose_name='Priorité')),
                ('source', models.CharField(choices=[('KANBAN', 'Kanban'), ('CONWIP', 'CONWIP'), ('DDMRP', 'DDMRP'), ('MANUEL', 'Manuel')], default='MANUEL', max_length=20, verbose_name='Source de création')),
                ('date_creation', models.DateTimeField(auto_now_add=True, verbose_name='Date de création')),
                ('date_debut', models.DateTimeField(blank=True, null=True, verbose_name='Date de début')),
                ('date_fin', models.DateTimeField(blank=True, null=True, verbose_name='Date de fin')),
                ('date_livraison_prevue', models.DateField(blank=True, null=True, verbose_name='Date de livraison prévue')),
                ('article', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ordres_fabrication', to='core.article', verbose_name='Article')),
                ('poste', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ordres_fabrication', to='core.postetravail', verbose_name='Poste de travail')),
            ],
            options={
                'verbose_name': 'Ordre de fabrication',
                'verbose_name_plural': 'Ordres de fabrication',
                'ordering': ['-priorite', '-date_creation'],
            },
        ),
    ]

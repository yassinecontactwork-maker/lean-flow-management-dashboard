                                               

import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='BufferDDMRP',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('adu', models.DecimalField(decimal_places=2, help_text='Consommation quotidienne moyenne', max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='ADU (Average Daily Usage)')),
                ('lead_time_jours', models.DecimalField(decimal_places=2, max_digits=5, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Lead Time (jours)')),
                ('facteur_lead_time', models.DecimalField(decimal_places=2, default=0.5, help_text='Multiplicateur du lead time (généralement 0.5)', max_digits=3, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Facteur Lead Time')),
                ('facteur_variabilite', models.DecimalField(decimal_places=2, default=0.5, help_text='Facteur de variabilité de la demande (0.0 à 1.0)', max_digits=3, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Facteur Variabilité')),
                ('stock_minimum_commande', models.DecimalField(decimal_places=2, default=0, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='MOQ (Minimum Order Quantity)')),
                ('zone_rouge', models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Zone Rouge (seuil critique)')),
                ('zone_jaune', models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Zone Jaune (seuil alerte)')),
                ('zone_verte', models.DecimalField(decimal_places=2, default=0, max_digits=10, verbose_name='Zone Verte (niveau optimal)')),
                ('stock_disponible', models.DecimalField(decimal_places=2, default=0, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Stock disponible')),
                ('actif', models.BooleanField(default=True, verbose_name='Buffer actif')),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('date_modification', models.DateTimeField(auto_now=True)),
                ('date_dernier_calcul', models.DateTimeField(blank=True, null=True, verbose_name='Date dernier calcul')),
                ('article', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='buffers_ddmrp', to='core.article', verbose_name='Article')),
                ('poste', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='buffers_ddmrp', to='core.postetravail', verbose_name='Poste de travail')),
            ],
            options={
                'verbose_name': 'Buffer DDMRP',
                'verbose_name_plural': 'Buffers DDMRP',
                'ordering': ['article__sku'],
                'unique_together': {('article', 'poste')},
            },
        ),
        migrations.CreateModel(
            name='Recommandation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type_recommandation', models.CharField(choices=[('REAPPRO', 'Réapprovisionnement'), ('ACCELERER', 'Accélérer production'), ('RALENTIR', 'Ralentir production'), ('ANNULER', 'Annuler commande')], max_length=20, verbose_name='Type de recommandation')),
                ('quantite', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Quantité recommandée')),
                ('priorite', models.IntegerField(default=3, validators=[django.core.validators.MinValueValidator(1)], verbose_name='Priorité (1=max, 5=min)')),
                ('statut', models.CharField(choices=[('EN_ATTENTE', 'En attente'), ('VALIDEE', 'Validée'), ('EXECUTEE', 'Exécutée'), ('REJETEE', 'Rejetée')], default='EN_ATTENTE', max_length=20, verbose_name='Statut')),
                ('justification', models.TextField(blank=True, help_text='Explication de la recommandation', verbose_name='Justification')),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('date_execution', models.DateTimeField(blank=True, null=True, verbose_name="Date d'exécution")),
                ('buffer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='recommandations', to='ddmrp.bufferddmrp', verbose_name='Buffer DDMRP')),
                ('ordre_fabrication', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='recommandations_ddmrp', to='core.ordrefabrication', verbose_name='Ordre de fabrication créé')),
            ],
            options={
                'verbose_name': 'Recommandation DDMRP',
                'verbose_name_plural': 'Recommandations DDMRP',
                'ordering': ['priorite', '-date_creation'],
            },
        ),
    ]

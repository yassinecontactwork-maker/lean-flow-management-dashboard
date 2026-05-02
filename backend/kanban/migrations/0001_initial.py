                                               

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
            name='ConfigFluxKanban',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('demande_moyenne', models.DecimalField(decimal_places=2, help_text='Demande quotidienne moyenne du poste consommateur', max_digits=10, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Demande moyenne (unités/jour)')),
                ('lead_time_jours', models.DecimalField(decimal_places=2, help_text='Temps de réapprovisionnement', max_digits=5, validators=[django.core.validators.MinValueValidator(Decimal('0'))], verbose_name='Lead Time (jours)')),
                ('capacite_conteneur', models.IntegerField(help_text="Nombre d'unités par carte Kanban", validators=[django.core.validators.MinValueValidator(1)], verbose_name='Capacité du conteneur')),
                ('nombre_cartes_optimal', models.IntegerField(default=0, help_text='Calculé automatiquement', verbose_name='Nombre de cartes optimal')),
                ('actif', models.BooleanField(default=True, verbose_name='Flux actif')),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('date_modification', models.DateTimeField(auto_now=True)),
                ('article', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='flux_kanban', to='core.article', verbose_name='Article')),
                ('poste_consommateur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='flux_kanban_consommes', to='core.postetravail', verbose_name='Poste consommateur')),
                ('poste_fournisseur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='flux_kanban_fournis', to='core.postetravail', verbose_name='Poste fournisseur')),
            ],
            options={
                'verbose_name': 'Configuration Flux Kanban',
                'verbose_name_plural': 'Configurations Flux Kanban',
                'ordering': ['article__sku'],
                'unique_together': {('article', 'poste_fournisseur', 'poste_consommateur')},
            },
        ),
        migrations.CreateModel(
            name='CarteKanban',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code_unique', models.CharField(help_text='Code unique de la carte (généré automatiquement)', max_length=50, unique=True, verbose_name='Code unique')),
                ('statut', models.CharField(choices=[('PLEIN', 'Plein'), ('VIDE', 'Vide')], default='PLEIN', max_length=10, verbose_name='Statut')),
                ('quantite', models.IntegerField(validators=[django.core.validators.MinValueValidator(0)], verbose_name='Quantité actuelle')),
                ('qr_code', models.ImageField(blank=True, null=True, upload_to='kanban_qrcodes/', verbose_name='QR Code')),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('date_dernier_scan', models.DateTimeField(blank=True, null=True, verbose_name='Date dernier scan')),
                ('ordre_fabrication', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='cartes_kanban', to='core.ordrefabrication', verbose_name='Ordre de fabrication associé')),
                ('flux', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cartes', to='kanban.configfluxkanban', verbose_name='Flux Kanban')),
            ],
            options={
                'verbose_name': 'Carte Kanban',
                'verbose_name_plural': 'Cartes Kanban',
                'ordering': ['-date_dernier_scan'],
            },
        ),
    ]

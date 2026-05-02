                                               

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Alerte',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type_alerte', models.CharField(choices=[('STOCK_BAS', 'Stock bas'), ('WIP_ELEVE', 'WIP élevé'), ('CARTES_VIDES', 'Cartes Kanban vides'), ('GOULET', "Goulet d'étranglement"), ('BUFFER_ROUGE', 'Buffer DDMRP en zone rouge'), ('RETARD_OF', 'Retard ordre de fabrication')], max_length=20, verbose_name="Type d'alerte")),
                ('severite', models.CharField(choices=[('CRITIQUE', 'Critique'), ('HAUTE', 'Haute'), ('MOYENNE', 'Moyenne'), ('BASSE', 'Basse')], default='MOYENNE', max_length=20, verbose_name='Sévérité')),
                ('statut', models.CharField(choices=[('ACTIVE', 'Active'), ('RESOLUE', 'Résolue'), ('IGNOREE', 'Ignorée')], default='ACTIVE', max_length=20, verbose_name='Statut')),
                ('message', models.TextField(verbose_name='Message')),
                ('details', models.JSONField(blank=True, default=dict, help_text='Informations complémentaires en JSON', verbose_name='Détails')),
                ('date_creation', models.DateTimeField(auto_now_add=True, verbose_name='Date de création')),
                ('date_resolution', models.DateTimeField(blank=True, null=True, verbose_name='Date de résolution')),
                ('article', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='alertes', to='core.article', verbose_name='Article concerné')),
                ('ordre_fabrication', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='alertes', to='core.ordrefabrication', verbose_name='OF concerné')),
                ('poste', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='alertes', to='core.postetravail', verbose_name='Poste concerné')),
            ],
            options={
                'verbose_name': 'Alerte',
                'verbose_name_plural': 'Alertes',
                'ordering': ['-date_creation'],
            },
        ),
        migrations.CreateModel(
            name='Conflit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type_conflit', models.CharField(choices=[('KANBAN_CONWIP', 'Conflit Kanban / CONWIP'), ('KANBAN_DDMRP', 'Conflit Kanban / DDMRP'), ('CONWIP_DDMRP', 'Conflit CONWIP / DDMRP'), ('MULTI', 'Conflit multi-signaux')], max_length=20, verbose_name='Type de conflit')),
                ('statut', models.CharField(choices=[('EN_ATTENTE', 'En attente de décision'), ('RESOLU_KANBAN', 'Résolu - Priorité Kanban'), ('RESOLU_CONWIP', 'Résolu - Priorité CONWIP'), ('RESOLU_DDMRP', 'Résolu - Priorité DDMRP'), ('RESOLU_MANUEL', 'Résolu - Décision manuelle'), ('IGNORE', 'Ignoré')], default='EN_ATTENTE', max_length=20, verbose_name='Statut')),
                ('description', models.TextField(verbose_name='Description du conflit')),
                ('priorite', models.IntegerField(default=3, validators=[django.core.validators.MinValueValidator(1)], verbose_name='Priorité (1=max, 5=min)')),
                ('signal_kanban', models.JSONField(blank=True, help_text='Données du signal Kanban', null=True, verbose_name='Signal Kanban')),
                ('signal_conwip', models.JSONField(blank=True, help_text='Données du signal CONWIP', null=True, verbose_name='Signal CONWIP')),
                ('signal_ddmrp', models.JSONField(blank=True, help_text='Données du signal DDMRP', null=True, verbose_name='Signal DDMRP')),
                ('decision', models.TextField(blank=True, help_text='Explication de la décision de résolution', verbose_name='Décision prise')),
                ('date_creation', models.DateTimeField(auto_now_add=True, verbose_name='Date de détection')),
                ('date_resolution', models.DateTimeField(blank=True, null=True, verbose_name='Date de résolution')),
                ('article', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conflits', to='core.article', verbose_name='Article concerné')),
                ('poste', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='conflits', to='core.postetravail', verbose_name='Poste concerné')),
            ],
            options={
                'verbose_name': 'Conflit',
                'verbose_name_plural': 'Conflits',
                'ordering': ['priorite', '-date_creation'],
            },
        ),
    ]

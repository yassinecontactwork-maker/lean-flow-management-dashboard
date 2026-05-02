                                               

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
            name='LigneProduction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=100, unique=True, verbose_name='Nom de la ligne')),
                ('description', models.TextField(blank=True, verbose_name='Description')),
                ('wip_critique', models.IntegerField(help_text='Nombre maximum de tickets CONWIP autorisés dans la ligne', validators=[django.core.validators.MinValueValidator(1)], verbose_name='WIP critique')),
                ('active', models.BooleanField(default=True, verbose_name='Ligne active')),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('date_modification', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Ligne de production',
                'verbose_name_plural': 'Lignes de production',
                'ordering': ['nom'],
            },
        ),
        migrations.CreateModel(
            name='SequencePoste',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ordre', models.IntegerField(validators=[django.core.validators.MinValueValidator(1)], verbose_name='Ordre dans la séquence')),
                ('ligne', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='conwip.ligneproduction', verbose_name='Ligne de production')),
                ('poste', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.postetravail', verbose_name='Poste de travail')),
            ],
            options={
                'verbose_name': 'Séquence de poste',
                'verbose_name_plural': 'Séquences de postes',
                'ordering': ['ligne', 'ordre'],
                'unique_together': {('ligne', 'ordre')},
            },
        ),
        migrations.AddField(
            model_name='ligneproduction',
            name='postes_sequence',
            field=models.ManyToManyField(related_name='lignes_production', through='conwip.SequencePoste', to='core.postetravail', verbose_name='Postes de travail'),
        ),
        migrations.CreateModel(
            name='TicketConwip',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('numero', models.CharField(max_length=50, unique=True, verbose_name='Numéro du ticket')),
                ('statut', models.CharField(choices=[('LIBRE', 'Libre'), ('EN_ATTENTE', 'En attente'), ('EN_COURS', 'En cours')], default='LIBRE', max_length=20, verbose_name='Statut')),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('date_liberation', models.DateTimeField(blank=True, null=True, verbose_name='Date de libération')),
                ('date_attribution', models.DateTimeField(blank=True, null=True, verbose_name="Date d'attribution")),
                ('ligne', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tickets_conwip', to='conwip.ligneproduction', verbose_name='Ligne de production')),
                ('ordre_fabrication', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tickets_conwip', to='core.ordrefabrication', verbose_name='Ordre de fabrication')),
                ('poste_actuel', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tickets_conwip_actuels', to='core.postetravail', verbose_name='Poste actuel')),
            ],
            options={
                'verbose_name': 'Ticket CONWIP',
                'verbose_name_plural': 'Tickets CONWIP',
                'ordering': ['-date_attribution'],
            },
        ),
    ]

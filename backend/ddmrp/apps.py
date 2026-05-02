"""
App configuration pour DDMRP
"""
from django.apps import AppConfig


class DdmrpConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ddmrp'
    verbose_name = 'DDMRP'

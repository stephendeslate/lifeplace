# backend/core/domains/contracts/apps.py
from django.apps import AppConfig


class ContractsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core.domains.contracts'
    label = 'contracts'
    verbose_name = 'Contracts'
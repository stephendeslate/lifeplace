# backend/core/domains/products/apps.py
from django.apps import AppConfig


class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core.domains.products'
    label = 'products'
    verbose_name = 'Products'
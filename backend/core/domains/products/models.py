# core/domains/products/models.py
from core.utils.models import BaseModel
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class ProductOption(BaseModel):
    """Products or packages that can be sold to clients"""
    TYPE_CHOICES = [
        ('PRODUCT', 'Product'),
        ('PACKAGE', 'Package'),
    ]
    name = models.CharField(max_length=200)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='PHP')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2)
    event_type = models.ForeignKey('events.EventType', on_delete=models.PROTECT, null=True, blank=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    is_active = models.BooleanField(default=True)
    allow_multiple = models.BooleanField(default=False)
    has_excess_hours = models.BooleanField(default=False)
    included_hours = models.PositiveIntegerField(null=True, blank=True)
    excess_hour_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return self.name


class Discount(BaseModel):
    """Discounts and promotional codes"""
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255)
    discount_type = models.CharField(max_length=20, choices=[
        ('PERCENTAGE', 'Percentage'),
        ('FIXED', 'Fixed Amount')
    ])
    value = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateField()
    valid_until = models.DateField(null=True, blank=True)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    current_uses = models.PositiveIntegerField(default=0)
    applicable_products = models.ManyToManyField(ProductOption, blank=True)

    def __str__(self):
        return f"{self.code} - {self.get_discount_type_display()}: {self.value}"

    def is_valid(self):
        """Check if discount is currently valid"""
        from django.utils import timezone
        today = timezone.now().date()

        if not self.is_active:
            return False
        if today < self.valid_from:
            return False
        if self.valid_until and today > self.valid_until:
            return False
        if self.max_uses and self.current_uses >= self.max_uses:
            return False
        return True

    class Meta:
        ordering = ['-created_at']
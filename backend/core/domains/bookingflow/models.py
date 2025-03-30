# backend/core/domains/bookingflow/models.py
from core.domains.events.models import EventType
from core.domains.products.models import ProductOption
from core.domains.questionnaires.models import Questionnaire
from django.db import models
from django.utils.translation import gettext_lazy as _


class BookingFlow(models.Model):
    """
    Main configuration for a booking flow process
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    event_type = models.ForeignKey(
        EventType, 
        on_delete=models.CASCADE, 
        related_name='booking_flows'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} for {self.event_type.name}"


class BookingStep(models.Model):
    """
    Step in a booking flow process
    """
    STEP_TYPE_CHOICES = [
        ('INTRO', 'Introduction'),
        ('EVENT_TYPE', 'Event Type Selection'),
        ('DATE', 'Date Selection'),
        ('QUESTIONNAIRE', 'Questionnaire'),
        ('PRODUCT', 'Product Selection'),
        ('ADDON', 'Add-on Selection'),
        ('SUMMARY', 'Booking Summary'),
        ('PAYMENT', 'Payment'),
        ('CONFIRMATION', 'Confirmation'),
        ('CUSTOM', 'Custom Step'),
    ]

    booking_flow = models.ForeignKey(
        BookingFlow, 
        on_delete=models.CASCADE, 
        related_name='steps'
    )
    name = models.CharField(max_length=255)
    step_type = models.CharField(max_length=20, choices=STEP_TYPE_CHOICES)
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True, help_text="Instructions for the client")
    order = models.PositiveIntegerField(help_text="Display order of this step")
    is_required = models.BooleanField(default=True)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['booking_flow', 'order']
        unique_together = [['booking_flow', 'order']]

    def __str__(self):
        return f"{self.name} (Step {self.order}) - {self.booking_flow.name}"


class QuestionnaireStepConfiguration(models.Model):
    """
    Configuration for questionnaire steps
    """
    step = models.OneToOneField(
        BookingStep, 
        on_delete=models.CASCADE, 
        related_name='questionnaire_config',
        limit_choices_to={'step_type': 'QUESTIONNAIRE'}
    )
    questionnaire = models.ForeignKey(
        Questionnaire, 
        on_delete=models.CASCADE, 
        related_name='booking_step_configs'
    )
    require_all_fields = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Questionnaire config for {self.step.name}"


class ProductStepConfiguration(models.Model):
    """
    Configuration for product selection steps
    """
    step = models.OneToOneField(
        BookingStep, 
        on_delete=models.CASCADE, 
        related_name='product_config',
        limit_choices_to={'step_type__in': ['PRODUCT', 'ADDON']}
    )
    products = models.ManyToManyField(
        ProductOption, 
        through='ProductStepItem',
        related_name='booking_step_configs'
    )
    min_selection = models.PositiveIntegerField(default=0)
    max_selection = models.PositiveIntegerField(default=0, help_text="0 means unlimited")
    selection_type = models.CharField(
        max_length=20, 
        choices=[
            ('SINGLE', 'Single Selection'),
            ('MULTIPLE', 'Multiple Selection'),
        ],
        default='SINGLE'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Product config for {self.step.name}"


class ProductStepItem(models.Model):
    """
    Product item for a product step with display order
    """
    config = models.ForeignKey(
        ProductStepConfiguration, 
        on_delete=models.CASCADE, 
        related_name='product_items'
    )
    product = models.ForeignKey(
        ProductOption, 
        on_delete=models.CASCADE, 
        related_name='step_items'
    )
    order = models.PositiveIntegerField(default=0)
    is_highlighted = models.BooleanField(default=False)
    custom_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="If set, overrides the product's default price"
    )
    custom_description = models.TextField(
        blank=True,
        help_text="If set, overrides the product's default description"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['config', 'order']
        unique_together = [['config', 'order']]

    def __str__(self):
        return f"{self.product.name} (Order {self.order}) - {self.config.step.name}"


class DateStepConfiguration(models.Model):
    """
    Configuration for date selection steps
    """
    step = models.OneToOneField(
        BookingStep, 
        on_delete=models.CASCADE, 
        related_name='date_config',
        limit_choices_to={'step_type': 'DATE'}
    )
    min_days_in_future = models.PositiveIntegerField(default=1)
    max_days_in_future = models.PositiveIntegerField(default=365)
    allow_time_selection = models.BooleanField(default=True)
    buffer_before_event = models.PositiveIntegerField(
        default=0,
        help_text="Buffer time in minutes before event"
    )
    buffer_after_event = models.PositiveIntegerField(
        default=0,
        help_text="Buffer time in minutes after event"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Date config for {self.step.name}"


class CustomStepConfiguration(models.Model):
    """
    Configuration for custom steps
    """
    step = models.OneToOneField(
        BookingStep, 
        on_delete=models.CASCADE, 
        related_name='custom_config',
        limit_choices_to={'step_type': 'CUSTOM'}
    )
    html_content = models.TextField(blank=True)
    use_react_component = models.BooleanField(default=False)
    component_name = models.CharField(max_length=255, blank=True)
    component_props = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Custom config for {self.step.name}"
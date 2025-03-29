# backend/core/domains/payments/models.py
from datetime import timedelta
from decimal import Decimal

from core.utils.models import BaseModel
from django.db import models
from django.utils import timezone


class Payment(BaseModel):
    """Records of payments for events"""
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    # Changed from invoice_id to payment_number to avoid conflict with invoice ForeignKey
    payment_number = models.CharField(max_length=50, unique=True)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    due_date = models.DateField()
    paid_on = models.DateField(null=True, blank=True)
    payment_method = models.ForeignKey('PaymentMethod', on_delete=models.SET_NULL, null=True, related_name='payments')
    description = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    reference_number = models.CharField(max_length=100, blank=True)
    is_manual = models.BooleanField(default=False)
    processed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='processed_payments')
    
    # Receipt fields (from PaymentReceipt)
    receipt_number = models.CharField(max_length=50, blank=True, null=True, unique=True)
    receipt_generated_on = models.DateTimeField(null=True, blank=True)
    receipt_sent = models.BooleanField(default=False)
    receipt_sent_on = models.DateTimeField(null=True, blank=True)
    receipt_pdf = models.FileField(upload_to='receipts/', null=True, blank=True)
    
    # Link to quote and invoice 
    quote = models.ForeignKey('sales.EventQuote', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    invoice = models.ForeignKey('Invoice', on_delete=models.SET_NULL, null=True, blank=True, related_name='related_payments')
    
    # For installment payments
    installment = models.ForeignKey('PaymentInstallment', on_delete=models.SET_NULL, null=True, blank=True, related_name='payment')

    def save(self, *args, **kwargs):
        if not self.payment_number:
            self.payment_number = self.generate_payment_number()
        
        super().save(*args, **kwargs)
        # Update event payment status
        self.event.update_payment_status()
        
        # Update workflow if applicable - trigger PAYMENT_RECEIVED event
        if self.status == 'COMPLETED' and hasattr(self.event, 'workflow_template') and self.event.workflow_template:
            from core.domains.workflows.models import WorkflowTrigger

            # Create the trigger record
            WorkflowTrigger.objects.create(
                event=self.event,
                stage=self.event.current_stage,
                trigger_type='PAYMENT_RECEIVED',
                details=f"Payment of ${self.amount} received",
                result_data={
                    'payment_id': self.id,
                    'amount': str(self.amount),
                    'payment_method': self.payment_method.type if self.payment_method else 'Unknown'
                }
            )
            
            # Check for stages triggered by payment
            next_stages = self.event.workflow_template.stages.filter(
                trigger_on_payment_received=True
            ).order_by('stage', 'order')
            
            if next_stages.exists():
                next_stage = next_stages.first()
                # Check if the event meets all criteria for this stage
                if next_stage.check_advancement_criteria(self.event):
                    next_stage.apply_to_event(self.event)

    def complete_payment(self):
        """Mark payment as complete and handle related processes"""
        self.status = 'COMPLETED'
        self.paid_on = timezone.now().date()
        self.save()
        
        # Generate receipt if payment completed
        if not self.receipt_number:
            self.generate_receipt()
        
        # Record in event timeline
        from core.domains.events.models import EventTimeline
        EventTimeline.objects.create(
            event=self.event,
            action_type='PAYMENT_RECEIVED',
            description=f"Payment of ${self.amount} received",
            is_public=True,
            action_data={
                'payment_id': self.id,
                'amount': str(self.amount),
                'payment_method': self.payment_method.type if self.payment_method else 'Unknown'
            }
        )
        
        # If this is an installment payment, update installment
        if self.installment:
            self.installment.status = 'PAID'
            self.installment.save()
        
        # Send payment notification
        self.send_receipt_notification()

    def generate_payment_number(self):
        """Generate a unique payment number"""
        return f"PAY-{timezone.now().strftime('%Y%m%d')}-{self.event.id}-{self.pk or 0}"
        
    def generate_receipt(self):
        """Generate receipt number and update receipt fields"""
        if not self.receipt_number and self.status == 'COMPLETED':
            self.receipt_number = f"REC-{timezone.now().strftime('%Y%m%d')}-{self.id}"
            self.receipt_generated_on = timezone.now()
            self.save(update_fields=['receipt_number', 'receipt_generated_on'])
            
            # Create PDF receipt (implementation depends on your PDF generation solution)
            # self.generate_receipt_pdf()
            
        return self.receipt_number
    
    def send_receipt_notification(self):
        """Send receipt notification to the client"""
        if self.status == 'COMPLETED' and not self.receipt_sent:
            # Create notification record
            PaymentNotification.objects.create(
                payment=self,
                notification_type='PAYMENT_RECEIVED',
                sent_at=timezone.now(),
                sent_to=self.event.client.email,
                is_successful=True
            )
            
            # Update receipt sent status
            self.receipt_sent = True
            self.receipt_sent_on = timezone.now()
            self.save(update_fields=['receipt_sent', 'receipt_sent_on'])
            
            return True
        return False
    
    def __str__(self):
        return f"Payment {self.payment_number} for Event {self.event.id}"

    class Meta:
        ordering = ['-due_date']


class PaymentGateway(BaseModel):
    """Payment gateway configurations"""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    # Store configuration securely - consider encryption for production
    config = models.JSONField(default=dict)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.name} Gateway"
    
    class Meta:
        ordering = ['name']


class PaymentMethod(BaseModel):
    """Saved payment methods for clients"""
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='payment_methods')
    type = models.CharField(max_length=50, choices=[
        ('CREDIT_CARD', 'Credit Card'),
        ('BANK_TRANSFER', 'Bank Transfer'),
        ('CHECK', 'Check'),
        ('CASH', 'Cash'),
        ('DIGITAL_WALLET', 'Digital Wallet')
    ])
    is_default = models.BooleanField(default=False)
    nickname = models.CharField(max_length=100, blank=True)
    instructions = models.TextField(blank=True)
    gateway = models.ForeignKey(PaymentGateway, on_delete=models.SET_NULL, null=True, blank=True)
    token_reference = models.CharField(max_length=255, blank=True)
    last_four = models.CharField(max_length=4, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.get_type_display()} ({self.nickname or 'Unnamed'})"
    
    def save(self, *args, **kwargs):
        # If this method is set as default, unset other defaults for this user
        if self.is_default:
            PaymentMethod.objects.filter(
                user=self.user,
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-is_default', '-created_at']


class PaymentTransaction(BaseModel):
    """Detailed payment transaction records with gateway info"""
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='transactions')
    gateway = models.ForeignKey(PaymentGateway, on_delete=models.PROTECT)
    transaction_id = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, choices=[
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled')
    ])
    response_data = models.JSONField(default=dict)
    error_message = models.TextField(blank=True)
    is_test = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Transaction {self.transaction_id} - {self.status}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Update payment status based on transaction status
        if self.status == 'COMPLETED' and self.payment.status != 'COMPLETED':
            self.payment.complete_payment()
        elif self.status == 'FAILED' and self.payment.status == 'PENDING':
            self.payment.status = 'FAILED'
            self.payment.save(update_fields=['status'])
    
    class Meta:
        ordering = ['-created_at']


class PaymentPlan(BaseModel):
    """Payment plan with installments for an event"""
    event = models.OneToOneField('events.Event', on_delete=models.CASCADE, related_name='payment_plan')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    down_payment_amount = models.DecimalField(max_digits=10, decimal_places=2)
    down_payment_due_date = models.DateField()
    number_of_installments = models.PositiveIntegerField()
    frequency = models.CharField(max_length=20, choices=[
        ('WEEKLY', 'Weekly'),
        ('BIWEEKLY', 'Bi-weekly'),
        ('MONTHLY', 'Monthly')
    ])
    notes = models.TextField(blank=True)
    
    # Link to quote that originated the plan
    quote = models.ForeignKey('sales.EventQuote', on_delete=models.SET_NULL, null=True, blank=True, related_name='payment_plans')
    
    def __str__(self):
        return f"Payment Plan for Event {self.event.id}"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Create installments if this is a new payment plan
        if is_new:
            self.create_installments()
    
    def create_installments(self):
        """Generate installment records based on plan configuration"""
        # First create down payment
        PaymentInstallment.objects.create(
            payment_plan=self,
            amount=self.down_payment_amount,
            due_date=self.down_payment_due_date,
            status='PENDING',
            installment_number=0,
            description="Down payment"
        )
        
        # Calculate remaining amount
        remaining_amount = self.total_amount - self.down_payment_amount
        installment_amount = remaining_amount / self.number_of_installments
        
        # Set frequency in days
        if self.frequency == 'WEEKLY':
            days = 7
        elif self.frequency == 'BIWEEKLY':
            days = 14
        else:  # MONTHLY
            days = 30
        
        # Create regular installments
        last_date = self.down_payment_due_date
        for i in range(1, self.number_of_installments + 1):
            last_date = last_date + timedelta(days=days)
            
            PaymentInstallment.objects.create(
                payment_plan=self,
                amount=installment_amount.quantize(Decimal('0.01')),
                due_date=last_date,
                status='PENDING',
                installment_number=i,
                description=f"Installment {i} of {self.number_of_installments}"
            )


class PaymentInstallment(BaseModel):
    """Individual installment for a payment plan"""
    payment_plan = models.ForeignKey(PaymentPlan, on_delete=models.CASCADE, related_name='installments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue')
    ])
    installment_number = models.PositiveIntegerField()
    description = models.CharField(max_length=255, blank=True)
    
    def __str__(self):
        return f"Installment {self.installment_number} - {self.status}"
    
    def check_status(self):
        """Check if installment is overdue and update status"""
        if self.status == 'PENDING' and self.due_date < timezone.now().date():
            self.status = 'OVERDUE'
            self.save(update_fields=['status'])
            
            # Create a notification
            PaymentNotification.objects.create(
                payment=None,  # No direct payment yet
                notification_type='PAYMENT_OVERDUE',
                sent_at=timezone.now(),
                sent_to=self.payment_plan.event.client.email,
                is_successful=True,
                reference=f"installment_{self.id}"
            )
            
            return True
        return False
    
    def create_payment(self):
        """Create a payment record for this installment"""
        # Check if payment already exists
        if hasattr(self, 'payment') and self.payment.exists():
            return self.payment.first()
        
        # Create payment for this installment
        payment = Payment.objects.create(
            event=self.payment_plan.event,
            amount=self.amount,
            status='PENDING',
            due_date=self.due_date,
            description=f"Payment for {self.description}",
            installment=self
        )
        
        return payment
    
    class Meta:
        ordering = ['installment_number']


class TaxRate(BaseModel):
    """Tax rates for different regions or product types"""
    name = models.CharField(max_length=100)
    rate = models.DecimalField(max_digits=5, decimal_places=2)
    region = models.CharField(max_length=100, blank=True)
    is_default = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.name} ({self.rate}%)"
    
    def save(self, *args, **kwargs):
        # If this rate is set as default, unset other defaults
        if self.is_default:
            TaxRate.objects.filter(is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class Refund(BaseModel):
    """Refund records for payments"""
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REJECTED', 'Rejected')
    ])
    refunded_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    refund_transaction_id = models.CharField(max_length=255, blank=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    
    def __str__(self):
        return f"Refund for Payment {self.payment.payment_number} - {self.status}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Add to event timeline
        if self.status == 'COMPLETED':
            from core.domains.events.models import EventTimeline
            EventTimeline.objects.create(
                event=self.payment.event,
                action_type='PAYMENT_RECEIVED',  # We could add a specific REFUND type
                description=f"Refund of ${self.amount} processed",
                actor=self.refunded_by,
                is_public=True,
                action_data={
                    'refund_id': self.id,
                    'payment_id': self.payment.id,
                    'amount': str(self.amount),
                    'reason': self.reason
                }
            )
    
    class Meta:
        ordering = ['-created_at']


class Invoice(BaseModel):
    """Invoice records for clients"""
    invoice_id = models.CharField(max_length=50, unique=True)
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='invoices')
    client = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='invoices')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    issue_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('DRAFT', 'Draft'),
        ('ISSUED', 'Issued'), 
        ('PAID', 'Paid'),
        ('VOID', 'Void'),
        ('CANCELLED', 'Cancelled')
    ])
    notes = models.TextField(blank=True)
    payment_terms = models.TextField(blank=True)
    
    # Link to quote that originated the invoice
    quote = models.ForeignKey('sales.EventQuote', on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    
    # PDF file
    invoice_pdf = models.FileField(upload_to='invoices/', null=True, blank=True)
    
    def __str__(self):
        return f"Invoice {self.invoice_id}"
    
    def calculate_totals(self):
        """Calculate invoice totals from line items"""
        line_items = self.line_items.all()
        self.subtotal = sum(item.total for item in line_items)
        self.tax_amount = sum(item.total * (item.tax_rate / 100) for item in line_items)
        self.total_amount = self.subtotal + self.tax_amount
        self.save(update_fields=['subtotal', 'tax_amount', 'total_amount'])
    
    def mark_as_paid(self):
        """Mark invoice as paid"""
        self.status = 'PAID'
        self.save(update_fields=['status'])
        
        # Update event's payment status
        self.event.update_payment_status()
    
    def issue(self):
        """Issue the invoice to the client"""
        self.status = 'ISSUED'
        self.issue_date = timezone.now().date()
        self.save(update_fields=['status', 'issue_date'])
        
        # Create payment notification
        PaymentNotification.objects.create(
            notification_type='INVOICE_ISSUED',
            sent_at=timezone.now(),
            sent_to=self.client.email,
            is_successful=True,
            reference=f"invoice_{self.id}"
        )
        
        # Generate PDF if not already generated
        # self.generate_pdf()
        
        # Add to event timeline
        from core.domains.events.models import EventTimeline
        EventTimeline.objects.create(
            event=self.event,
            action_type='SYSTEM_UPDATE',
            description=f"Invoice {self.invoice_id} issued to client",
            is_public=True,
            action_data={'invoice_id': self.id}
        )
    
    @classmethod
    def create_from_quote(cls, quote, due_days=14):
        """Create an invoice from an accepted quote"""
        if not quote or not quote.event:
            return None
        
        # Create invoice
        invoice = cls.objects.create(
            invoice_id=f"INV-{timezone.now().strftime('%Y%m%d')}-{quote.event.id}-{quote.id}",
            event=quote.event,
            client=quote.event.client,
            subtotal=quote.subtotal,
            tax_amount=quote.tax_amount,
            total_amount=quote.total_amount,
            issue_date=timezone.now().date(),
            due_date=timezone.now().date() + timedelta(days=due_days),
            status='DRAFT',
            notes=f"Invoice generated from quote #{quote.id}",
            quote=quote
        )
        
        # Create line items from quote
        for quote_item in quote.line_items.all():
            InvoiceLineItem.objects.create(
                invoice=invoice,
                description=quote_item.description,
                quantity=quote_item.quantity,
                unit_price=quote_item.unit_price,
                tax_rate=quote_item.tax_rate,
                total=quote_item.total
            )
        
        return invoice


class InvoiceLineItem(BaseModel):
    """Line items on an invoice"""
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='line_items')
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    product = models.ForeignKey('products.ProductOption', on_delete=models.SET_NULL, null=True, blank=True)

    def save(self, *args, **kwargs):
        # Auto-calculate total if not set
        if not self.total:
            self.total = self.quantity * self.unit_price
        super().save(*args, **kwargs)
        
        # Update invoice totals
        self.invoice.calculate_totals()

    def __str__(self):
        return f"{self.description} - {self.invoice.invoice_id}"


class InvoiceTax(BaseModel):
    """Applied tax on an invoice"""
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='taxes')
    tax_rate = models.ForeignKey(TaxRate, on_delete=models.PROTECT)
    taxable_amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"Tax {self.tax_rate.name} on Invoice {self.invoice.invoice_id}"


class PaymentNotification(BaseModel):
    """Records of payment-related notifications sent to clients"""
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=[
        ('INVOICE_ISSUED', 'Invoice Issued'),
        ('PAYMENT_REMINDER', 'Payment Reminder'),
        ('PAYMENT_RECEIVED', 'Payment Received'),
        ('PAYMENT_OVERDUE', 'Payment Overdue'),
        ('RECEIPT_SENT', 'Receipt Sent')
    ])
    sent_at = models.DateTimeField()
    sent_to = models.EmailField()
    template_used = models.ForeignKey('communications.EmailTemplate', null=True, blank=True, on_delete=models.SET_NULL)
    is_successful = models.BooleanField(default=True)
    reference = models.CharField(max_length=255, blank=True, help_text="Reference to related object, e.g., invoice_123")
    
    def __str__(self):
        return f"{self.get_notification_type_display()} sent to {self.sent_to} on {self.sent_at.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-sent_at']
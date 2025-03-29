# backend/core/domains/sales/tests.py
from core.domains.events.models import Event, EventType
from core.domains.products.models import ProductOption
from core.domains.users.models import User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import EventQuote, QuoteTemplate, QuoteTemplateProduct


class SalesModelTests(TestCase):
    """Test case for sales models"""
    
    def setUp(self):
        """Set up test data"""
        # Create event type
        self.event_type = EventType.objects.create(
            name="Wedding",
            description="Wedding event type",
            is_active=True
        )
        
        # Create client user
        self.client_user = User.objects.create_user(
            email="client@example.com",
            password="clientpassword",
            first_name="Client",
            last_name="User",
            role="CLIENT"
        )
        
        # Create event
        self.event = Event.objects.create(
            client=self.client_user,
            event_type=self.event_type,
            name="Test Wedding",
            status="LEAD",
            start_date=timezone.now().date()
        )
        
        # Create product
        self.product = ProductOption.objects.create(
            name="Photography Package",
            description="Basic photography package",
            base_price=1000.00,
            type="PACKAGE",
            is_active=True
        )
        
        # Create quote template
        self.template = QuoteTemplate.objects.create(
            name="Wedding Quote",
            introduction="Thank you for your interest in our services.",
            event_type=self.event_type,
            terms_and_conditions="Standard terms apply.",
            is_active=True
        )
        
        # Add product to template
        self.template_product = QuoteTemplateProduct.objects.create(
            template=self.template,
            product=self.product,
            quantity=1,
            is_required=True
        )
        
        # Create quote
        self.quote = EventQuote.objects.create(
            event=self.event,
            template=self.template,
            version=1,
            status="DRAFT",
            total_amount=1000.00,
            valid_until=timezone.now().date() + timezone.timedelta(days=30),
            notes="Initial quote",
            terms_and_conditions="Standard terms apply."
        )
    
    def test_quote_template_creation(self):
        """Test creating a quote template"""
        self.assertEqual(self.template.name, "Wedding Quote")
        self.assertEqual(self.template.event_type, self.event_type)
        self.assertTrue(self.template.is_active)
    
    def test_quote_template_product_relation(self):
        """Test quote template product relation"""
        self.assertEqual(self.template_product.template, self.template)
        self.assertEqual(self.template_product.product, self.product)
        self.assertEqual(self.template_product.quantity, 1)
        self.assertTrue(self.template_product.is_required)
    
    def test_event_quote_creation(self):
        """Test creating an event quote"""
        self.assertEqual(self.quote.event, self.event)
        self.assertEqual(self.quote.template, self.template)
        self.assertEqual(self.quote.version, 1)
        self.assertEqual(self.quote.status, "DRAFT")
        self.assertEqual(self.quote.total_amount, 1000.00)
    
    def test_event_quote_versioning(self):
        """Test event quote versioning"""
        # Create a second version
        second_quote = EventQuote.objects.create(
            event=self.event,
            template=self.template,
            version=2,
            status="DRAFT",
            total_amount=1200.00,
            valid_until=timezone.now().date() + timezone.timedelta(days=30),
            notes="Updated quote with additional services"
        )
        
        # Verify versions
        self.assertEqual(self.quote.version, 1)
        self.assertEqual(second_quote.version, 2)
        
        # Verify ordering
        quotes = EventQuote.objects.filter(event=self.event).order_by('-version')
        self.assertEqual(quotes[0], second_quote)
        self.assertEqual(quotes[1], self.quote)
    
    def test_string_representation(self):
        """Test string representation of models"""
        self.assertEqual(str(self.template), "Wedding Quote")
        self.assertEqual(str(self.quote), f"Quote 1 for Event {self.event.id}")


class SalesAPITests(APITestCase):
    """Test case for the sales API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        # Create admin user
        self.admin_user = User.objects.create_user(
            email="admin@example.com",
            password="adminpassword",
            first_name="Admin",
            last_name="User",
            role="ADMIN",
            is_staff=True
        )
        
        # Create client user
        self.client_user = User.objects.create_user(
            email="client@example.com",
            password="clientpassword",
            first_name="Client",
            last_name="User",
            role="CLIENT"
        )
        
        # Create event type
        self.event_type = EventType.objects.create(
            name="Wedding",
            description="Wedding event type",
            is_active=True
        )
        
        # Create event
        self.event = Event.objects.create(
            client=self.client_user,
            event_type=self.event_type,
            name="Test Wedding",
            status="LEAD",
            start_date=timezone.now().date()
        )
        
        # Create product
        self.product = ProductOption.objects.create(
            name="Photography Package",
            description="Basic photography package",
            base_price=1000.00,
            type="PACKAGE",
            is_active=True
        )
        
        # Create quote template
        self.template = QuoteTemplate.objects.create(
            name="Wedding Quote",
            introduction="Thank you for your interest in our services.",
            event_type=self.event_type,
            terms_and_conditions="Standard terms apply.",
            is_active=True
        )
        
        # Add product to template
        self.template_product = QuoteTemplateProduct.objects.create(
            template=self.template,
            product=self.product,
            quantity=1,
            is_required=True
        )
        
        # Create quote
        self.quote = EventQuote.objects.create(
            event=self.event,
            template=self.template,
            version=1,
            status="DRAFT",
            total_amount=1000.00,
            valid_until=timezone.now().date() + timezone.timedelta(days=30),
            notes="Initial quote",
            terms_and_conditions="Standard terms apply."
        )
        
        # URLs
        self.templates_url = reverse('sales:template-list')
        self.template_detail_url = reverse('sales:template-detail', args=[self.template.id])
        self.quotes_url = reverse('sales:quote-list')
        self.quote_detail_url = reverse('sales:quote-detail', args=[self.quote.id])
        self.send_quote_url = reverse('sales:quote-send', args=[self.quote.id])
        self.accept_quote_url = reverse('sales:quote-accept', args=[self.quote.id])
        self.reject_quote_url = reverse('sales:quote-reject', args=[self.quote.id])
        self.duplicate_quote_url = reverse('sales:quote-duplicate', args=[self.quote.id])
        self.event_quotes_url = reverse('sales:quote-for-event') + f'?event_id={self.event.id}'
    
    def test_unauthorized_access(self):
        """Test unauthorized access to sales API"""
        response = self.client.get(self.templates_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_client_access_denied(self):
        """Test client user cannot access sales admin API"""
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(self.templates_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_list_templates(self):
        """Test that admin can list templates"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.templates_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], "Wedding Quote")
    
    def test_create_template(self):
        """Test creating a new template"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': 'Corporate Event Quote',
            'introduction': 'Thank you for your interest in our corporate event services.',
            'event_type': self.event_type.id,
            'terms_and_conditions': 'Special corporate terms apply.',
            'is_active': True
        }
        response = self.client.post(self.templates_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(QuoteTemplate.objects.count(), 2)
        self.assertEqual(response.data['name'], 'Corporate Event Quote')
    
    def test_retrieve_update_template(self):
        """Test retrieving and updating a template"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Retrieve
        response = self.client.get(self.template_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Wedding Quote")
        
        # Update
        update_data = {
            'name': 'Updated Wedding Quote',
            'is_active': False
        }
        response = self.client.patch(self.template_detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Wedding Quote')
        self.assertFalse(response.data['is_active'])
    
    def test_delete_template(self):
        """Test deleting a template"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.template_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(QuoteTemplate.objects.count(), 0)
    
    def test_list_event_quotes(self):
        """Test listing quotes for an event"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.event_quotes_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['event'], self.event.id)
    
    def test_create_quote(self):
        """Test creating a new quote"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'event': self.event.id,
            'template': self.template.id,
            'total_amount': 1500.00,
            'valid_until': (timezone.now().date() + timezone.timedelta(days=30)).isoformat(),
            'notes': 'New quote with additional services'
        }
        response = self.client.post(self.quotes_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EventQuote.objects.count(), 2)
        self.assertEqual(EventQuote.objects.latest('created_at').version, 2)
        self.assertEqual(response.data['total_amount'], '1500.00')
    
    def test_quote_workflow(self):
        """Test the complete quote workflow: draft, send, accept"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Send quote
        response = self.client.post(self.send_quote_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'SENT')
        self.assertIsNotNone(response.data['sent_at'])
        
        # Accept quote
        data = {'notes': 'Client has accepted the quote'}
        response = self.client.post(self.accept_quote_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'ACCEPTED')
        self.assertIsNotNone(response.data['accepted_at'])
        self.assertEqual(response.data['notes'], 'Client has accepted the quote')
    
    def test_quote_rejection(self):
        """Test rejecting a quote"""
        self.client.force_authenticate(user=self.admin_user)
        
        # First send the quote
        self.client.post(self.send_quote_url)
        
        # Then reject it
        data = {'notes': 'Client found better pricing elsewhere'}
        response = self.client.post(self.reject_quote_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'REJECTED')
        self.assertEqual(response.data['notes'], 'Client found better pricing elsewhere')
    
    def test_quote_duplication(self):
        """Test duplicating a quote"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.duplicate_quote_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(EventQuote.objects.count(), 2)
        
        # Verify the new quote
        new_quote = EventQuote.objects.latest('created_at')
        self.assertEqual(new_quote.version, 2)
        self.assertEqual(new_quote.status, 'DRAFT')
        self.assertEqual(new_quote.total_amount, self.quote.total_amount)
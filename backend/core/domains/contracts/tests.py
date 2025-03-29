# backend/core/domains/contracts/tests.py
from datetime import datetime, timedelta

from core.domains.events.models import Event, EventType
from core.domains.users.models import User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import ContractTemplate, EventContract
from .services import ContractTemplateService, EventContractService


class ContractModelTests(TestCase):
    """Test case for contract models"""
    
    def setUp(self):
        """Set up test data"""
        # Create event type
        self.event_type = EventType.objects.create(
            name="Corporate Event",
            description="Corporate event type",
            is_active=True
        )
        
        # Create user
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
        
        # Create an event
        self.event = Event.objects.create(
            name="Test Event",
            status="CONFIRMED",
            start_date=timezone.now().date() + timedelta(days=30),
            event_type=self.event_type,
            client=self.client_user
        )
        
        # Create contract template
        self.template = ContractTemplate.objects.create(
            name="Standard Agreement",
            description="Standard agreement for corporate events",
            event_type=self.event_type,
            content="This is a contract between {{company_name}} and the client {{client_name}}.",
            variables=["company_name", "client_name"],
            requires_signature=True,
            sections=[
                {"title": "Introduction", "content": "This is the introduction section."},
                {"title": "Terms and Conditions", "content": "These are the terms."}
            ]
        )
    
    def test_contract_template_creation(self):
        """Test creating a contract template"""
        self.assertEqual(self.template.name, "Standard Agreement")
        self.assertEqual(self.template.event_type, self.event_type)
        self.assertTrue(self.template.requires_signature)
        self.assertEqual(len(self.template.variables), 2)
        self.assertEqual(len(self.template.sections), 2)
    
    def test_event_contract_creation(self):
        """Test creating an event contract"""
        contract = EventContract.objects.create(
            event=self.event,
            template=self.template,
            status='DRAFT',
            content="This is a contract between LifePlace and the client John Doe.",
            valid_until=timezone.now().date() + timedelta(days=14)
        )
        
        self.assertEqual(contract.event, self.event)
        self.assertEqual(contract.template, self.template)
        self.assertEqual(contract.status, 'DRAFT')
        self.assertIn("LifePlace", contract.content)
        self.assertIsNotNone(contract.valid_until)
    
    def test_event_contract_signing(self):
        """Test signing an event contract"""
        contract = EventContract.objects.create(
            event=self.event,
            template=self.template,
            status='SENT',
            content="This is a contract between LifePlace and the client John Doe.",
            sent_at=timezone.now()
        )
        
        # Sign the contract
        contract.status = 'SIGNED'
        contract.signed_at = timezone.now()
        contract.signed_by = self.client_user
        contract.signature_data = "base64_encoded_signature_data"
        contract.witness_name = "Jane Witness"
        contract.save()
        
        # Reload from database
        contract.refresh_from_db()
        
        self.assertEqual(contract.status, 'SIGNED')
        self.assertIsNotNone(contract.signed_at)
        self.assertEqual(contract.signed_by, self.client_user)
        self.assertEqual(contract.signature_data, "base64_encoded_signature_data")
        self.assertEqual(contract.witness_name, "Jane Witness")


class ContractServiceTests(TestCase):
    """Test case for contract services"""
    
    def setUp(self):
        """Set up test data"""
        # Create event type
        self.event_type = EventType.objects.create(
            name="Corporate Event",
            description="Corporate event type",
            is_active=True
        )
        
        # Create user
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
        
        # Create an event
        self.event = Event.objects.create(
            name="Test Event",
            status="CONFIRMED",
            start_date=timezone.now().date() + timedelta(days=30),
            event_type=self.event_type,
            client=self.client_user
        )
        
        # Create contract template
        self.template = ContractTemplate.objects.create(
            name="Standard Agreement",
            description="Standard agreement for corporate events",
            event_type=self.event_type,
            content="This is a contract between {{company_name}} and the client {{client_name}}.",
            variables=["company_name", "client_name"],
            requires_signature=True
        )
    
    def test_get_all_templates(self):
        """Test getting all templates"""
        templates = ContractTemplateService.get_all_templates()
        self.assertEqual(templates.count(), 1)
        self.assertEqual(templates.first().name, "Standard Agreement")
    
    def test_get_templates_with_filters(self):
        """Test getting templates with filters"""
        # Create another template
        ContractTemplate.objects.create(
            name="Wedding Agreement",
            description="Wedding agreement template",
            event_type=None,  # No event type
            content="Wedding contract",
            variables=[],
            requires_signature=True
        )
        
        # Test filtering by event type
        templates = ContractTemplateService.get_all_templates(event_type_id=self.event_type.id)
        self.assertEqual(templates.count(), 1)
        self.assertEqual(templates.first().name, "Standard Agreement")
        
        # Test search
        templates = ContractTemplateService.get_all_templates(search_query="wedding")
        self.assertEqual(templates.count(), 1)
        self.assertEqual(templates.first().name, "Wedding Agreement")
    
    def test_create_contract_from_template(self):
        """Test creating a contract from a template"""
        context_data = {
            "company_name": "LifePlace Events",
            "client_name": "John Smith"
        }
        
        contract = EventContractService.create_contract_from_template(
            event_id=self.event.id,
            template_id=self.template.id,
            valid_until=timezone.now().date() + timedelta(days=14),
            context_data=context_data
        )
        
        self.assertEqual(contract.event, self.event)
        self.assertEqual(contract.template, self.template)
        self.assertEqual(contract.status, 'DRAFT')
        self.assertIn("LifePlace Events", contract.content)
        self.assertIn("John Smith", contract.content)
    
    def test_sign_contract(self):
        """Test signing a contract"""
        # Create a contract in SENT status
        contract = EventContract.objects.create(
            event=self.event,
            template=self.template,
            status='SENT',
            content="This is a contract between LifePlace and the client John Doe.",
            sent_at=timezone.now()
        )
        
        # Sign the contract
        signed_contract = EventContractService.sign_contract(
            contract_id=contract.id,
            user_id=self.client_user.id,
            signature_data="base64_encoded_signature_data",
            witness_name="Jane Witness",
            witness_signature="base64_encoded_witness_signature"
        )
        
        self.assertEqual(signed_contract.status, 'SIGNED')
        self.assertIsNotNone(signed_contract.signed_at)
        self.assertEqual(signed_contract.signed_by, self.client_user)
        self.assertEqual(signed_contract.signature_data, "base64_encoded_signature_data")
        self.assertEqual(signed_contract.witness_name, "Jane Witness")
        self.assertEqual(signed_contract.witness_signature, "base64_encoded_witness_signature")


class ContractAPITests(APITestCase):
    """Test case for the contracts API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        # Create event type
        self.event_type = EventType.objects.create(
            name="Corporate Event",
            description="Corporate event type",
            is_active=True
        )
        
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
        
        # Create an event
        self.event = Event.objects.create(
            name="Test Event",
            status="CONFIRMED",
            start_date=timezone.now().date() + timedelta(days=30),
            event_type=self.event_type,
            client=self.client_user
        )
        
        # Create contract template
        self.template = ContractTemplate.objects.create(
            name="Standard Agreement",
            description="Standard agreement for corporate events",
            event_type=self.event_type,
            content="This is a contract between {{company_name}} and the client {{client_name}}.",
            variables=["company_name", "client_name"],
            requires_signature=True,
            sections=[
                {"title": "Introduction", "content": "This is the introduction section."},
                {"title": "Terms and Conditions", "content": "These are the terms."}
            ]
        )
        
        # Create event contract
        self.contract = EventContract.objects.create(
            event=self.event,
            template=self.template,
            status='DRAFT',
            content="This is a contract between LifePlace and the client John Doe."
        )
        
        # URLs
        self.templates_url = reverse('contracts:template-list')
        self.template_detail_url = reverse('contracts:template-detail', args=[self.template.id])
        self.contracts_url = reverse('contracts:contract-list')
        self.contract_detail_url = reverse('contracts:contract-detail', args=[self.contract.id])
        self.contract_sign_url = reverse('contracts:contract-sign', args=[self.contract.id])
        self.contract_void_url = reverse('contracts:contract-void', args=[self.contract.id])
    
    def test_list_templates_admin(self):
        """Test that admins can list contract templates"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.templates_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], "Standard Agreement")
    
    def test_list_templates_client(self):
        """Test that clients cannot list contract templates"""
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(self.templates_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_template(self):
        """Test creating a new template"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': 'New Template',
            'description': 'New template description',
            'event_type': self.event_type.id,
            'content': 'Contract content with {{variable}}',
            'variables': ['variable'],
            'requires_signature': True,
            'sections': [
                {"title": "Section 1", "content": "Content for section 1"}
            ]
        }
        response = self.client.post(self.templates_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ContractTemplate.objects.count(), 2)
        self.assertEqual(response.data['name'], 'New Template')
    
    def test_update_template(self):
        """Test updating a template"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': 'Updated Template',
            'description': 'Updated description'
        }
        response = self.client.patch(self.template_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Template')
        self.assertEqual(response.data['description'], 'Updated description')
    
    def test_list_contracts_admin(self):
        """Test that admins can list contracts"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.contracts_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_list_contracts_client(self):
        """Test that clients can only list their contracts"""
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(self.contracts_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
        # Create an event and contract for another client
        other_client = User.objects.create_user(
            email="other@example.com",
            password="otherpassword",
            role="CLIENT"
        )
        other_event = Event.objects.create(
            name="Other Event",
            status="CONFIRMED",
            start_date=timezone.now().date() + timedelta(days=30),
            event_type=self.event_type,
            client=other_client
        )
        EventContract.objects.create(
            event=other_event,
            template=self.template,
            status='DRAFT',
            content="Other client's contract"
        )
        
        # Client should still only see their own contract
        response = self.client.get(self.contracts_url)
        self.assertEqual(len(response.data), 1)
    
    def test_create_contract(self):
        """Test creating a new contract"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'event': self.event.id,
            'template': self.template.id,
            'context_data': {
                'company_name': 'LifePlace Events',
                'client_name': 'John Client'
            }
        }
        response = self.client.post(self.contracts_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(EventContract.objects.count(), 2)
        self.assertIn('LifePlace Events', response.data['content'])
        self.assertIn('John Client', response.data['content'])
    
    def test_sign_contract(self):
        """Test signing a contract"""
        # Update contract to SENT status
        self.contract.status = 'SENT'
        self.contract.sent_at = timezone.now()
        self.contract.save()
        
        self.client.force_authenticate(user=self.client_user)
        data = {
            'signature_data': 'base64_encoded_signature_data',
            'witness_name': 'Jane Witness'
        }
        response = self.client.post(self.contract_sign_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'SIGNED')
        
        # Verify contract is updated in database
        self.contract.refresh_from_db()
        self.assertEqual(self.contract.status, 'SIGNED')
        self.assertIsNotNone(self.contract.signed_at)
        self.assertEqual(self.contract.signed_by, self.client_user)
    
    def test_void_contract(self):
        """Test voiding a contract"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'reason': 'Client requested cancellation'
        }
        response = self.client.post(self.contract_void_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'VOID')
        
        # Verify contract is updated in database
        self.contract.refresh_from_db()
        self.assertEqual(self.contract.status, 'VOID')
# backend/core/domains/workflows/tests.py
from core.domains.communications.models import EmailTemplate
from core.domains.events.models import EventType
from core.domains.users.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import WorkflowStage, WorkflowTemplate


class WorkflowModelTests(TestCase):
    """Test case for workflow models"""
    
    def setUp(self):
        """Set up test data"""
        # Create event type
        self.event_type = EventType.objects.create(
            name="Wedding",
            description="Wedding event type",
            is_active=True
        )
        
        # Create email template
        self.email_template = EmailTemplate.objects.create(
            name="Test Email",
            subject="Test Subject",
            body="Test Body"
        )
        
        # Create workflow template
        self.template = WorkflowTemplate.objects.create(
            name="Wedding Workflow",
            description="Standard workflow for weddings",
            event_type=self.event_type,
            is_active=True
        )
        
        # Create workflow stages
        self.lead_stage = WorkflowStage.objects.create(
            template=self.template,
            name="Initial Contact",
            stage="LEAD",
            order=1,
            is_automated=False,
            task_description="Make initial contact with client"
        )
        
        self.automated_stage = WorkflowStage.objects.create(
            template=self.template,
            name="Welcome Email",
            stage="LEAD",
            order=2,
            is_automated=True,
            automation_type="EMAIL",
            trigger_time="ON_CREATION",
            email_template=self.email_template,
            task_description="Send welcome email"
        )
        
        self.production_stage = WorkflowStage.objects.create(
            template=self.template,
            name="Shoot Planning",
            stage="PRODUCTION",
            order=1,
            is_automated=False,
            task_description="Plan the shoot with client"
        )
    
    def test_workflow_template_creation(self):
        """Test creating a workflow template"""
        self.assertEqual(self.template.name, "Wedding Workflow")
        self.assertEqual(self.template.event_type, self.event_type)
        self.assertTrue(self.template.is_active)
    
    def test_workflow_stage_creation(self):
        """Test creating workflow stages"""
        # Test lead stage
        self.assertEqual(self.lead_stage.name, "Initial Contact")
        self.assertEqual(self.lead_stage.stage, "LEAD")
        self.assertEqual(self.lead_stage.order, 1)
        self.assertFalse(self.lead_stage.is_automated)
        
        # Test automated stage
        self.assertEqual(self.automated_stage.name, "Welcome Email")
        self.assertTrue(self.automated_stage.is_automated)
        self.assertEqual(self.automated_stage.automation_type, "EMAIL")
        self.assertEqual(self.automated_stage.email_template, self.email_template)
    
    def test_workflow_stage_ordering(self):
        """Test stage ordering within a template"""
        # Get all lead stages in order
        lead_stages = self.template.stages.filter(stage="LEAD").order_by('order')
        self.assertEqual(lead_stages.count(), 2)
        self.assertEqual(lead_stages[0], self.lead_stage)
        self.assertEqual(lead_stages[1], self.automated_stage)
        
        # Get all production stages
        production_stages = self.template.stages.filter(stage="PRODUCTION").order_by('order')
        self.assertEqual(production_stages.count(), 1)
        self.assertEqual(production_stages[0], self.production_stage)
    
    def test_string_representation(self):
        """Test string representation of models"""
        self.assertEqual(str(self.template), "Wedding Workflow")
        self.assertEqual(str(self.lead_stage), "Wedding Workflow - Initial Contact")


class WorkflowAPITests(APITestCase):
    """Test case for the workflow API endpoints"""
    
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
        
        # Create regular user
        self.regular_user = User.objects.create_user(
            email="user@example.com",
            password="userpassword",
            first_name="Regular",
            last_name="User",
            role="CLIENT"
        )
        
        # Create event type
        self.event_type = EventType.objects.create(
            name="Wedding",
            description="Wedding event type",
            is_active=True
        )
        
        # Create email template
        self.email_template = EmailTemplate.objects.create(
            name="Test Email",
            subject="Test Subject",
            body="Test Body"
        )
        
        # Create workflow template
        self.template = WorkflowTemplate.objects.create(
            name="Wedding Workflow",
            description="Standard workflow for weddings",
            event_type=self.event_type,
            is_active=True
        )
        
        # Create workflow stages
        self.lead_stage = WorkflowStage.objects.create(
            template=self.template,
            name="Initial Contact",
            stage="LEAD",
            order=1,
            is_automated=False,
            task_description="Make initial contact with client"
        )
        
        self.production_stage = WorkflowStage.objects.create(
            template=self.template,
            name="Shoot Planning",
            stage="PRODUCTION",
            order=1,
            is_automated=False,
            task_description="Plan the shoot with client"
        )
        
        # URLs
        self.templates_url = reverse('workflows:template-list')
        self.template_detail_url = reverse('workflows:template-detail', args=[self.template.id])
        self.stages_url = reverse('workflows:stage-list')
        self.lead_stage_detail_url = reverse('workflows:stage-detail', args=[self.lead_stage.id])
        self.template_stages_url = reverse('workflows:template-stages', args=[self.template.id])
    
    def test_unauthorized_access(self):
        """Test unauthorized access to workflow API"""
        response = self.client.get(self.templates_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_regular_user_access(self):
        """Test regular user cannot access workflow API"""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.templates_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_view_templates(self):
        """Test that admin can view templates"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.templates_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], "Wedding Workflow")
    
    def test_create_template(self):
        """Test creating a new template"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': 'Corporate Event Workflow',
            'description': 'Standard workflow for corporate events',
            'event_type': self.event_type.id,
            'is_active': True,
            'stages': [
                {
                    'name': 'Initial Meeting',
                    'stage': 'LEAD',
                    'order': 1,
                    'is_automated': False,
                    'task_description': 'Schedule initial meeting with client'
                },
                {
                    'name': 'Site Visit',
                    'stage': 'PRODUCTION',
                    'order': 1,
                    'is_automated': False,
                    'task_description': 'Visit the event site'
                }
            ]
        }
        response = self.client.post(self.templates_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WorkflowTemplate.objects.count(), 2)
        self.assertEqual(response.data['name'], 'Corporate Event Workflow')
        self.assertEqual(len(response.data['stages']), 2)
    
    def test_retrieve_template_with_stages(self):
        """Test retrieving a template with its stages"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.template_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Wedding Workflow")
        self.assertEqual(len(response.data['stages']), 2)
    
    def test_update_template(self):
        """Test updating a template"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': 'Updated Wedding Workflow',
            'description': 'Updated description'
        }
        response = self.client.patch(self.template_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Wedding Workflow')
        self.assertEqual(response.data['description'], 'Updated description')
    
    def test_create_stage(self):
        """Test creating a new stage"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'template': self.template.id,
            'name': 'Final Review',
            'stage': 'POST_PRODUCTION',
            'order': 1,
            'is_automated': False,
            'task_description': 'Review final deliverables'
        }
        response = self.client.post(self.stages_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(WorkflowStage.objects.count(), 3)
        self.assertEqual(response.data['name'], 'Final Review')
    
    def test_create_automated_stage_without_email_template(self):
        """Test validation for automated email stages"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'template': self.template.id,
            'name': 'Automated Follow-up',
            'stage': 'LEAD',
            'order': 3,
            'is_automated': True,
            'automation_type': 'EMAIL',
            'trigger_time': 'AFTER_1_DAY',
            # Missing email_template
            'task_description': 'Send automated follow-up'
        }
        response = self.client.post(self.stages_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_reorder_stages(self):
        """Test reordering stages"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Add another LEAD stage
        new_stage = WorkflowStage.objects.create(
            template=self.template,
            name="Second Contact",
            stage="LEAD",
            order=2,
            is_automated=False,
            task_description="Follow up with client"
        )
        
        # Reorder the LEAD stages
        reorder_url = reverse('workflows:stage-reorder')
        data = {
            'template_id': self.template.id,
            'stage_type': 'LEAD',
            'order_mapping': {
                str(self.lead_stage.id): 2,
                str(new_stage.id): 1
            }
        }
        response = self.client.post(reorder_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh stages from database
        self.lead_stage.refresh_from_db()
        new_stage.refresh_from_db()
        
        # Check that orders were updated
        self.assertEqual(self.lead_stage.order, 2)
        self.assertEqual(new_stage.order, 1)
    
    def test_delete_stage(self):
        """Test deleting a stage"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.lead_stage_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(WorkflowStage.objects.count(), 1)
    
    def test_delete_template(self):
        """Test deleting a template"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.template_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(WorkflowTemplate.objects.count(), 0)
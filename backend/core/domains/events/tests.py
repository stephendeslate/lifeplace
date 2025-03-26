# backend/core/domains/events/tests.py
from datetime import timedelta

from core.domains.users.models import User
from core.domains.workflows.models import WorkflowStage, WorkflowTemplate
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Event, EventFeedback, EventFile, EventTask, EventTimeline, EventType
from .services import (
    EventFeedbackService,
    EventFileService,
    EventService,
    EventTaskService,
    EventTimelineService,
    EventTypeService,
)


class EventTypeModelTests(TestCase):
    """Test case for the EventType model"""
    
    def setUp(self):
        """Set up test data"""
        self.event_type = EventType.objects.create(
            name="Wedding",
            description="Wedding photography event",
            is_active=True
        )
    
    def test_event_type_creation(self):
        """Test creating an event type"""
        self.assertEqual(self.event_type.name, "Wedding")
        self.assertEqual(self.event_type.description, "Wedding photography event")
        self.assertTrue(self.event_type.is_active)
    
    def test_event_type_string_representation(self):
        """Test the string representation of an event type"""
        self.assertEqual(str(self.event_type), "Wedding")


class EventModelTests(TestCase):
    """Test case for the Event model"""
    
    def setUp(self):
        """Set up test data"""
        # Create user
        self.client_user = User.objects.create_user(
            email="client@example.com",
            password="password123",
            first_name="Test",
            last_name="Client",
            role="CLIENT"
        )
        
        # Create event type
        self.event_type = EventType.objects.create(
            name="Wedding",
            description="Wedding photography event",
            is_active=True
        )
        
        # Create workflow template
        self.workflow_template = WorkflowTemplate.objects.create(
            name="Wedding Workflow",
            description="Standard workflow for weddings",
            is_active=True
        )
        
        # Create workflow stages
        self.lead_stage = WorkflowStage.objects.create(
            template=self.workflow_template,
            name="Initial Contact",
            stage="LEAD",
            order=1,
            is_automated=False
        )
        
        self.production_stage = WorkflowStage.objects.create(
            template=self.workflow_template,
            name="Shoot Day",
            stage="PRODUCTION",
            order=1,
            is_automated=False
        )
        
        # Create event
        self.event = Event.objects.create(
            client=self.client_user,
            event_type=self.event_type,
            name="Smith Wedding",
            status="LEAD",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=31),
            workflow_template=self.workflow_template,
            current_stage=self.lead_stage,
            total_price=2000.00,
            total_amount_due=2000.00
        )
        
        # Create task
        self.task = EventTask.objects.create(
            event=self.event,
            title="Initial consultation",
            description="Schedule initial consultation with client",
            due_date=timezone.now() + timedelta(days=5),
            priority="MEDIUM",
            status="PENDING"
        )
    
    def test_event_creation(self):
        """Test creating an event"""
        self.assertEqual(self.event.name, "Smith Wedding")
        self.assertEqual(self.event.status, "LEAD")
        self.assertEqual(self.event.client, self.client_user)
        self.assertEqual(self.event.event_type, self.event_type)
        self.assertEqual(self.event.workflow_template, self.workflow_template)
        self.assertEqual(self.event.current_stage, self.lead_stage)
    
    def test_workflow_progress(self):
        """Test calculating workflow progress"""
        # Initially in lead stage
        self.assertEqual(self.event.workflow_progress, 50.0)  # 1/2 stages = 50%
        
        # Update to production stage
        self.event.current_stage = self.production_stage
        self.event.save()
        self.assertEqual(self.event.workflow_progress, 100.0)  # 2/2 stages = 100%
    
    def test_next_task(self):
        """Test getting the next task"""
        next_task = self.event.next_task
        self.assertEqual(next_task, self.task)
        
        # Complete the task
        self.task.status = "COMPLETED"
        self.task.save()
        
        # Refresh the event
        self.event.refresh_from_db()
        self.assertIsNone(self.event.next_task)
    
    def test_update_payment_status(self):
        """Test updating payment status"""
        # Initially unpaid
        self.assertEqual(self.event.payment_status, "UNPAID")
        
        # Simulate a partial payment
        self.event.total_amount_paid = 1000.00
        self.event.update_payment_status()
        self.assertEqual(self.event.payment_status, "PARTIALLY_PAID")
        
        # Simulate full payment
        self.event.total_amount_paid = 2000.00
        self.event.update_payment_status()
        self.assertEqual(self.event.payment_status, "PAID")


class EventTypeServiceTests(TestCase):
    """Test case for the EventTypeService"""
    
    def setUp(self):
        """Set up test data"""
        self.event_type1 = EventType.objects.create(
            name="Wedding",
            description="Wedding photography event",
            is_active=True
        )
        
        self.event_type2 = EventType.objects.create(
            name="Portrait",
            description="Portrait photography session",
            is_active=False
        )
    
    def test_get_all_event_types(self):
        """Test getting all event types"""
        # Get all event types
        event_types = EventTypeService.get_all_event_types()
        self.assertEqual(event_types.count(), 2)
        
        # Filter by active status
        active_types = EventTypeService.get_all_event_types(is_active=True)
        self.assertEqual(active_types.count(), 1)
        self.assertEqual(active_types.first().name, "Wedding")
        
        # Filter by search query
        search_results = EventTypeService.get_all_event_types(search_query="port")
        self.assertEqual(search_results.count(), 1)
        self.assertEqual(search_results.first().name, "Portrait")
    
    def test_get_event_type_by_id(self):
        """Test getting an event type by ID"""
        event_type = EventTypeService.get_event_type_by_id(self.event_type1.id)
        self.assertEqual(event_type.name, "Wedding")
    
    def test_create_event_type(self):
        """Test creating an event type"""
        event_type_data = {
            "name": "Corporate",
            "description": "Corporate event photography",
            "is_active": True
        }
        
        event_type = EventTypeService.create_event_type(event_type_data)
        self.assertEqual(event_type.name, "Corporate")
        self.assertEqual(event_type.description, "Corporate event photography")
        self.assertTrue(EventType.objects.filter(name="Corporate").exists())
    
    def test_update_event_type(self):
        """Test updating an event type"""
        event_type_data = {
            "name": "Updated Wedding",
            "description": "Updated description"
        }
        
        updated_event_type = EventTypeService.update_event_type(
            self.event_type1.id,
            event_type_data
        )
        
        self.assertEqual(updated_event_type.name, "Updated Wedding")
        self.assertEqual(updated_event_type.description, "Updated description")
    
    def test_delete_event_type(self):
        """Test deleting an event type"""
        result = EventTypeService.delete_event_type(self.event_type2.id)
        self.assertTrue(result)
        self.assertFalse(EventType.objects.filter(id=self.event_type2.id).exists())


class EventAPITests(APITestCase):
    """Test case for the Event API endpoints"""
    
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
            first_name="Test",
            last_name="Client",
            role="CLIENT"
        )
        
        # Create event type
        self.event_type = EventType.objects.create(
            name="Wedding",
            description="Wedding photography event",
            is_active=True
        )
        
        # Create workflow template
        self.workflow_template = WorkflowTemplate.objects.create(
            name="Wedding Workflow",
            description="Standard workflow for weddings",
            is_active=True
        )
        
        # Create workflow stage
        self.workflow_stage = WorkflowStage.objects.create(
            template=self.workflow_template,
            name="Initial Contact",
            stage="LEAD",
            order=1,
            is_automated=False
        )
        
        # Create event
        self.event = Event.objects.create(
            client=self.client_user,
            event_type=self.event_type,
            name="Smith Wedding",
            status="LEAD",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=31),
            workflow_template=self.workflow_template,
            current_stage=self.workflow_stage,
            total_price=2000.00,
            total_amount_due=2000.00
        )
        
        # Create task
        self.task = EventTask.objects.create(
            event=self.event,
            title="Initial consultation",
            description="Schedule initial consultation with client",
            due_date=timezone.now() + timedelta(days=5),
            priority="MEDIUM",
            status="PENDING"
        )
        
        # URLs
        self.event_types_url = reverse('events:event-type-list')
        self.events_url = reverse('events:event-list')
        self.event_detail_url = reverse('events:event-detail', args=[self.event.id])
        self.event_tasks_url = reverse('events:event-tasks', args=[self.event.id])
    
    def test_unauthorized_access(self):
        """Test unauthorized access to event API"""
        response = self.client.get(self.events_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_event_type_list(self):
        """Test listing event types"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.event_types_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Wedding")
    
    def test_event_list(self):
        """Test listing events"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.events_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], "Smith Wedding")
    
    def test_event_detail(self):
        """Test retrieving event detail"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.event_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Smith Wedding")
        self.assertEqual(response.data['status'], "LEAD")
    
    def test_create_event(self):
        """Test creating a new event"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "client": self.client_user.id,
            "event_type": self.event_type.id,
            "name": "Johnson Wedding",
            "status": "LEAD",
            "start_date": (timezone.now() + timedelta(days=60)).isoformat(),
            "end_date": (timezone.now() + timedelta(days=61)).isoformat(),
            "workflow_template": self.workflow_template.id,
            "current_stage": self.workflow_stage.id,
            "total_price": 2500.00,
            "total_amount_due": 2500.00,
            "tasks": [
                {
                    "title": "Initial meeting",
                    "description": "Meet with clients",
                    "due_date": (timezone.now() + timedelta(days=10)).isoformat(),
                    "priority": "HIGH",
                    "status": "PENDING"
                }
            ]
        }
        
        response = self.client.post(self.events_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Event.objects.count(), 2)
        self.assertEqual(response.data['name'], "Johnson Wedding")
    
    def test_update_event(self):
        """Test updating an event"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "name": "Updated Smith Wedding",
            "status": "CONFIRMED"
        }
        
        response = self.client.patch(self.event_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Updated Smith Wedding")
        self.assertEqual(response.data['status'], "CONFIRMED")
    
    def test_event_tasks(self):
        """Test listing tasks for an event"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.event_tasks_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Initial consultation")
    
    def test_update_event_status(self):
        """Test updating an event's status"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('events:event-update-status', args=[self.event.id])
        data = {"status": "CONFIRMED"}
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], "CONFIRMED")
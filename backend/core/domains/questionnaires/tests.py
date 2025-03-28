# backend/core/domains/questionnaires/tests.py
from core.domains.events.models import Event, EventType
from core.domains.users.models import User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Questionnaire, QuestionnaireField, QuestionnaireResponse


class QuestionnaireModelTests(TestCase):
    """Test case for the Questionnaire models"""
    
    def setUp(self):
        """Set up test data"""
        # Create event type
        self.event_type = EventType.objects.create(
            name="Wedding",
            description="Wedding event type",
            is_active=True
        )
        
        # Create questionnaire
        self.questionnaire = Questionnaire.objects.create(
            name="Client Information",
            event_type=self.event_type,
            is_active=True,
            order=1
        )
        
        # Create questionnaire fields
        self.text_field = QuestionnaireField.objects.create(
            questionnaire=self.questionnaire,
            name="Special Requests",
            type="text",
            required=True,
            order=1
        )
        
        self.select_field = QuestionnaireField.objects.create(
            questionnaire=self.questionnaire,
            name="Preferred Contact Method",
            type="select",
            required=True,
            order=2,
            options=["Email", "Phone", "Text"]
        )
    
    def test_questionnaire_creation(self):
        """Test creating a questionnaire"""
        self.assertEqual(self.questionnaire.name, "Client Information")
        self.assertEqual(self.questionnaire.event_type, self.event_type)
        self.assertTrue(self.questionnaire.is_active)
        self.assertEqual(self.questionnaire.order, 1)
    
    def test_questionnaire_field_creation(self):
        """Test creating questionnaire fields"""
        # Test text field
        self.assertEqual(self.text_field.name, "Special Requests")
        self.assertEqual(self.text_field.type, "text")
        self.assertTrue(self.text_field.required)
        self.assertEqual(self.text_field.order, 1)
        self.assertIsNone(self.text_field.options)
        
        # Test select field
        self.assertEqual(self.select_field.name, "Preferred Contact Method")
        self.assertEqual(self.select_field.type, "select")
        self.assertTrue(self.select_field.required)
        self.assertEqual(self.select_field.order, 2)
        self.assertEqual(self.select_field.options, ["Email", "Phone", "Text"])
    
    def test_questionnaire_string_representation(self):
        """Test string representation of models"""
        self.assertEqual(str(self.questionnaire), "Client Information")
        self.assertEqual(str(self.text_field), "Client Information - Special Requests")


class QuestionnaireAPITests(APITestCase):
    """Test case for the questionnaire API endpoints"""
    
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
            name="Smith Wedding",
            status="LEAD",
            start_date=timezone.now() + timezone.timedelta(days=30),
            end_date=timezone.now() + timezone.timedelta(days=31)
        )
        
        # Create questionnaire
        self.questionnaire = Questionnaire.objects.create(
            name="Client Information",
            event_type=self.event_type,
            is_active=True,
            order=1
        )
        
        # Create questionnaire fields
        self.text_field = QuestionnaireField.objects.create(
            questionnaire=self.questionnaire,
            name="Special Requests",
            type="text",
            required=True,
            order=1
        )
        
        self.select_field = QuestionnaireField.objects.create(
            questionnaire=self.questionnaire,
            name="Preferred Contact Method",
            type="select",
            required=True,
            order=2,
            options=["Email", "Phone", "Text"]
        )
        
        # Create a response
        self.response = QuestionnaireResponse.objects.create(
            event=self.event,
            field=self.text_field,
            value="No nuts in the food please"
        )
        
        # URLs
        self.questionnaires_url = reverse('questionnaires:questionnaire-list')
        self.questionnaire_detail_url = reverse('questionnaires:questionnaire-detail', args=[self.questionnaire.id])
        self.questionnaire_fields_url = reverse('questionnaires:questionnaire-fields', args=[self.questionnaire.id])
        self.fields_url = reverse('questionnaires:field-list')
        self.field_detail_url = reverse('questionnaires:field-detail', args=[self.text_field.id])
        self.responses_url = reverse('questionnaires:response-list')
        self.response_detail_url = reverse('questionnaires:response-detail', args=[self.response.id])
    
    def test_unauthorized_access(self):
        """Test unauthorized access to questionnaire API"""
        response = self.client.get(self.questionnaires_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_regular_user_cannot_access(self):
        """Test regular user cannot access questionnaire management API"""
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(self.questionnaires_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_view_questionnaires(self):
        """Test that admin can view questionnaires"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.questionnaires_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], "Client Information")
    
    def test_create_questionnaire(self):
        """Test creating a new questionnaire"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "name": "Venue Information",
            "event_type": self.event_type.id,
            "is_active": True,
            "order": 2,
            "fields": [
                {
                    "name": "Venue Name",
                    "type": "text",
                    "required": True,
                    "order": 1
                },
                {
                    "name": "Venue Type",
                    "type": "select",
                    "required": True,
                    "order": 2,
                    "options": ["Indoor", "Outdoor", "Both"]
                }
            ]
        }
        response = self.client.post(self.questionnaires_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Questionnaire.objects.count(), 2)
        self.assertEqual(response.data['name'], "Venue Information")
        self.assertEqual(len(response.data['fields']), 2)
    
    def test_update_questionnaire(self):
        """Test updating a questionnaire"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "name": "Updated Client Information",
            "is_active": False
        }
        response = self.client.patch(self.questionnaire_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Updated Client Information")
        self.assertFalse(response.data['is_active'])
    
    def test_create_field(self):
        """Test creating a new field"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "questionnaire": self.questionnaire.id,
            "name": "Dietary Restrictions",
            "type": "multi-select",
            "required": False,
            "order": 3,
            "options": ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut Allergy"]
        }
        response = self.client.post(self.fields_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(QuestionnaireField.objects.count(), 3)
        self.assertEqual(response.data['name'], "Dietary Restrictions")
        self.assertEqual(response.data['type'], "multi-select")
        self.assertEqual(response.data['options'], ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut Allergy"])
    
    def test_create_field_without_options(self):
        """Test validation for creating a select field without options"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "questionnaire": self.questionnaire.id,
            "name": "Invalid Select",
            "type": "select",
            "required": True,
            "order": 4
        }
        response = self.client.post(self.fields_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_response(self):
        """Test creating a response"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "event": self.event.id,
            "field": self.select_field.id,
            "value": "Email"
        }
        response = self.client.post(self.responses_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(QuestionnaireResponse.objects.count(), 2)
        self.assertEqual(response.data['value'], "Email")
    
    def test_create_response_with_invalid_option(self):
        """Test validation for creating a response with invalid option"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "event": self.event.id,
            "field": self.select_field.id,
            "value": "Invalid Option"
        }
        response = self.client.post(self.responses_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_save_event_responses(self):
        """Test saving multiple responses for an event"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "event": self.event.id,
            "responses": [
                {
                    "field": self.text_field.id,
                    "value": "Updated special request"
                },
                {
                    "field": self.select_field.id,
                    "value": "Phone"
                }
            ]
        }
        response = self.client.post(
            reverse('questionnaires:response-save-event-responses'),
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data), 2)
        
        # Check that old responses were replaced
        event_responses = QuestionnaireResponse.objects.filter(event=self.event)
        self.assertEqual(event_responses.count(), 2)
        
        text_response = event_responses.get(field=self.text_field)
        self.assertEqual(text_response.value, "Updated special request")
        
        select_response = event_responses.get(field=self.select_field)
        self.assertEqual(select_response.value, "Phone")
    
    def test_delete_questionnaire(self):
        """Test deleting a questionnaire"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.questionnaire_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Questionnaire.objects.count(), 0)
        
        # Also check that fields were deleted (cascade)
        self.assertEqual(QuestionnaireField.objects.count(), 0)
    
    def test_reorder_fields(self):
        """Test reordering fields"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Add another field for testing
        third_field = QuestionnaireField.objects.create(
            questionnaire=self.questionnaire,
            name="Guest Count",
            type="number",
            required=True,
            order=3
        )
        
        # Reorder the fields
        data = {
            "questionnaire_id": self.questionnaire.id,
            "order_mapping": {
                str(self.text_field.id): 3,
                str(self.select_field.id): 1,
                str(third_field.id): 2
            }
        }
        response = self.client.post(
            reverse('questionnaires:field-reorder'),
            data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh fields from database
        self.text_field.refresh_from_db()
        self.select_field.refresh_from_db()
        third_field.refresh_from_db()
        
        # Check that orders were updated
        self.assertEqual(self.text_field.order, 3)
        self.assertEqual(self.select_field.order, 1)
        self.assertEqual(third_field.order, 2)
# backend/core/domains/bookingflow/tests.py
from core.domains.events.models import EventType
from core.domains.products.models import ProductOption
from core.domains.questionnaires.models import Questionnaire
from core.domains.users.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import (
    BookingFlow,
    BookingStep,
    CustomStepConfiguration,
    DateStepConfiguration,
    ProductStepConfiguration,
    ProductStepItem,
    QuestionnaireStepConfiguration,
)
from .services import BookingFlowService, BookingStepService, ProductStepItemService


class BookingFlowServiceTests(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='admin@example.com',
            password='password',
            first_name='Admin',
            last_name='User',
            role='ADMIN'
        )
        
        # Create test event type
        self.event_type = EventType.objects.create(
            name='Test Event Type',
            description='Test Description',
            is_active=True
        )
        
        # Create test booking flow
        self.booking_flow = BookingFlow.objects.create(
            name='Test Booking Flow',
            description='Test Description',
            event_type=self.event_type,
            is_active=True
        )
        
        # Create test booking step
        self.booking_step = BookingStep.objects.create(
            booking_flow=self.booking_flow,
            name='Test Step',
            step_type='INTRO',
            description='Test Description',
            order=1,
            is_required=True,
            is_visible=True
        )
    
    def test_get_all_flows(self):
        """Test getting all booking flows with filters"""
        flows = BookingFlowService.get_all_flows()
        self.assertEqual(flows.count(), 1)
        
        # Test with event type filter
        flows = BookingFlowService.get_all_flows(event_type_id=self.event_type.id)
        self.assertEqual(flows.count(), 1)
        
        # Test with search
        flows = BookingFlowService.get_all_flows(search_query='Test')
        self.assertEqual(flows.count(), 1)
        
        # Test with inactive filter
        flows = BookingFlowService.get_all_flows(is_active=False)
        self.assertEqual(flows.count(), 0)
    
    def test_get_flow_by_id(self):
        """Test getting a booking flow by ID"""
        flow = BookingFlowService.get_flow_by_id(self.booking_flow.id)
        self.assertEqual(flow.name, 'Test Booking Flow')
    
    def test_create_flow(self):
        """Test creating a new booking flow"""
        flow_data = {
            'name': 'New Booking Flow',
            'description': 'New Description',
            'event_type': self.event_type.id,
            'is_active': True
        }
        
        flow = BookingFlowService.create_flow(flow_data)
        self.assertEqual(flow.name, 'New Booking Flow')
        self.assertEqual(BookingFlow.objects.count(), 2)
    
    def test_update_flow(self):
        """Test updating an existing booking flow"""
        flow_data = {
            'name': 'Updated Booking Flow',
            'description': 'Updated Description'
        }
        
        flow = BookingFlowService.update_flow(self.booking_flow.id, flow_data)
        self.assertEqual(flow.name, 'Updated Booking Flow')
        self.assertEqual(flow.description, 'Updated Description')
    
    def test_delete_flow(self):
        """Test deleting a booking flow"""
        result = BookingFlowService.delete_flow(self.booking_flow.id)
        self.assertTrue(result)
        self.assertEqual(BookingFlow.objects.count(), 0)


class BookingStepServiceTests(TestCase):
    def setUp(self):
        # Create test event type
        self.event_type = EventType.objects.create(
            name='Test Event Type',
            description='Test Description',
            is_active=True
        )
        
        # Create test booking flow
        self.booking_flow = BookingFlow.objects.create(
            name='Test Booking Flow',
            description='Test Description',
            event_type=self.event_type,
            is_active=True
        )
        
        # Create test questionnaire
        self.questionnaire = Questionnaire.objects.create(
            name='Test Questionnaire',
            event_type=self.event_type,
            is_active=True,
            order=1
        )
        
        # Create test product
        self.product = ProductOption.objects.create(
            name='Test Product',
            type='PRODUCT',
            description='Test Description',
            price=100.00,
            is_active=True
        )
        
        # Create test steps for different types
        self.intro_step = BookingStep.objects.create(
            booking_flow=self.booking_flow,
            name='Intro Step',
            step_type='INTRO',
            description='Test Description',
            order=1,
            is_required=True,
            is_visible=True
        )
        
        self.questionnaire_step = BookingStep.objects.create(
            booking_flow=self.booking_flow,
            name='Questionnaire Step',
            step_type='QUESTIONNAIRE',
            description='Test Description',
            order=2,
            is_required=True,
            is_visible=True
        )
        
        self.questionnaire_config = QuestionnaireStepConfiguration.objects.create(
            step=self.questionnaire_step,
            questionnaire=self.questionnaire,
            require_all_fields=False
        )
        
        self.product_step = BookingStep.objects.create(
            booking_flow=self.booking_flow,
            name='Product Step',
            step_type='PRODUCT',
            description='Test Description',
            order=3,
            is_required=True,
            is_visible=True
        )
        
        self.product_config = ProductStepConfiguration.objects.create(
            step=self.product_step,
            min_selection=1,
            max_selection=5,
            selection_type='MULTIPLE'
        )
        
        self.product_item = ProductStepItem.objects.create(
            config=self.product_config,
            product=self.product,
            order=1,
            is_highlighted=True
        )
    
    def test_get_steps_for_flow(self):
        """Test getting all steps for a flow"""
        steps = BookingStepService.get_steps_for_flow(self.booking_flow.id)
        self.assertEqual(steps.count(), 3)
    
    def test_get_step_by_id(self):
        """Test getting a booking step by ID"""
        step = BookingStepService.get_step_by_id(self.intro_step.id)
        self.assertEqual(step.name, 'Intro Step')
    
    def test_create_step(self):
        """Test creating a new booking step"""
        step_data = {
            'name': 'New Step',
            'step_type': 'DATE',
            'description': 'New Description',
            'order': 4,
            'is_required': True,
            'is_visible': True,
            'date_config': {
                'min_days_in_future': 7,
                'max_days_in_future': 90,
                'allow_time_selection': True
            }
        }
        
        step = BookingStepService.create_step(self.booking_flow.id, step_data)
        self.assertEqual(step.name, 'New Step')
        self.assertEqual(BookingStep.objects.count(), 4)
        self.assertTrue(hasattr(step, 'date_config'))
        self.assertEqual(step.date_config.min_days_in_future, 7)
    
    def test_update_step(self):
        """Test updating an existing booking step"""
        step_data = {
            'name': 'Updated Step',
            'description': 'Updated Description'
        }
        
        step = BookingStepService.update_step(self.intro_step.id, step_data)
        self.assertEqual(step.name, 'Updated Step')
        self.assertEqual(step.description, 'Updated Description')
    
    def test_reorder_steps(self):
        """Test reordering steps"""
        # Create order mapping to swap the first two steps
        order_mapping = {
            str(self.intro_step.id): 2,
            str(self.questionnaire_step.id): 1
        }
        
        BookingStepService.reorder_steps(self.booking_flow.id, order_mapping)
        
        # Refresh from DB
        intro_step = BookingStep.objects.get(id=self.intro_step.id)
        questionnaire_step = BookingStep.objects.get(id=self.questionnaire_step.id)
        
        self.assertEqual(intro_step.order, 2)
        self.assertEqual(questionnaire_step.order, 1)
    
    def test_delete_step(self):
        """Test deleting a booking step"""
        result = BookingStepService.delete_step(self.intro_step.id)
        self.assertTrue(result)
        self.assertEqual(BookingStep.objects.count(), 2)
        
        # Verify order was updated for remaining steps
        questionnaire_step = BookingStep.objects.get(id=self.questionnaire_step.id)
        product_step = BookingStep.objects.get(id=self.product_step.id)
        
        self.assertEqual(questionnaire_step.order, 1)
        self.assertEqual(product_step.order, 2)


class ProductStepItemServiceTests(TestCase):
    def setUp(self):
        # Create test event type
        self.event_type = EventType.objects.create(
            name='Test Event Type',
            description='Test Description',
            is_active=True
        )
        
        # Create test booking flow
        self.booking_flow = BookingFlow.objects.create(
            name='Test Booking Flow',
            description='Test Description',
            event_type=self.event_type,
            is_active=True
        )
        
        # Create test products
        self.product1 = ProductOption.objects.create(
            name='Test Product 1',
            type='PRODUCT',
            description='Test Description 1',
            price=100.00,
            is_active=True
        )
        
        self.product2 = ProductOption.objects.create(
            name='Test Product 2',
            type='PRODUCT',
            description='Test Description 2',
            price=200.00,
            is_active=True
        )
        
        # Create test product step
        self.product_step = BookingStep.objects.create(
            booking_flow=self.booking_flow,
            name='Product Step',
            step_type='PRODUCT',
            description='Test Description',
            order=1,
            is_required=True,
            is_visible=True
        )
        
        self.product_config = ProductStepConfiguration.objects.create(
            step=self.product_step,
            min_selection=1,
            max_selection=5,
            selection_type='MULTIPLE'
        )
        
        # Create test product items
        self.product_item1 = ProductStepItem.objects.create(
            config=self.product_config,
            product=self.product1,
            order=1,
            is_highlighted=True
        )
        
        self.product_item2 = ProductStepItem.objects.create(
            config=self.product_config,
            product=self.product2,
            order=2,
            is_highlighted=False
        )
    
    def test_get_items_for_config(self):
        """Test getting all items for a config"""
        items = ProductStepItemService.get_items_for_config(self.product_config.id)
        self.assertEqual(items.count(), 2)
    
    def test_get_item_by_id(self):
        """Test getting a product item by ID"""
        item = ProductStepItemService.get_item_by_id(self.product_item1.id)
        self.assertEqual(item.product.name, 'Test Product 1')
    
    def test_create_item(self):
        """Test creating a new product item"""
        item_data = {
            'product': self.product1,
            'order': 3,
            'is_highlighted': True,
            'custom_price': 150.00
        }
        
        item = ProductStepItemService.create_item(self.product_config.id, item_data)
        self.assertEqual(item.product.name, 'Test Product 1')
        self.assertEqual(item.order, 3)
        self.assertEqual(item.custom_price, 150.00)
    
    def test_update_item(self):
        """Test updating an existing product item"""
        item_data = {
            'custom_price': 120.00,
            'is_highlighted': False
        }
        
        item = ProductStepItemService.update_item(self.product_item1.id, item_data)
        self.assertEqual(item.custom_price, 120.00)
        self.assertFalse(item.is_highlighted)
    
    def test_reorder_items(self):
        """Test reordering product items"""
        # Create order mapping to swap the items
        order_mapping = {
            str(self.product_item1.id): 2,
            str(self.product_item2.id): 1
        }
        
        ProductStepItemService.reorder_items(self.product_config.id, order_mapping)
        
        # Refresh from DB
        product_item1 = ProductStepItem.objects.get(id=self.product_item1.id)
        product_item2 = ProductStepItem.objects.get(id=self.product_item2.id)
        
        self.assertEqual(product_item1.order, 2)
        self.assertEqual(product_item2.order, 1)
    
    def test_delete_item(self):
        """Test deleting a product item"""
        result = ProductStepItemService.delete_item(self.product_item1.id)
        self.assertTrue(result)
        self.assertEqual(ProductStepItem.objects.count(), 1)
        
        # Verify order was updated for remaining item
        product_item2 = ProductStepItem.objects.get(id=self.product_item2.id)
        self.assertEqual(product_item2.order, 1)


class BookingFlowAPITests(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='admin@example.com',
            password='password',
            first_name='Admin',
            last_name='User',
            role='ADMIN'
        )
        
        # Create test event type
        self.event_type = EventType.objects.create(
            name='Test Event Type',
            description='Test Description',
            is_active=True
        )
        
        # Create API client and authenticate
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Create test booking flow
        self.booking_flow = BookingFlow.objects.create(
            name='Test Booking Flow',
            description='Test Description',
            event_type=self.event_type,
            is_active=True
        )
        
        # Create test step
        self.booking_step = BookingStep.objects.create(
            booking_flow=self.booking_flow,
            name='Test Step',
            step_type='INTRO',
            description='Test Description',
            order=1,
            is_required=True,
            is_visible=True
        )
    
    def test_list_flows(self):
        """Test listing booking flows"""
        url = reverse('booking-flows-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_retrieve_flow(self):
        """Test retrieving a booking flow"""
        url = reverse('booking-flows-detail', args=[self.booking_flow.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Booking Flow')
    
    def test_create_flow(self):
        """Test creating a booking flow"""
        url = reverse('booking-flows-list')
        data = {
            'name': 'New Booking Flow',
            'description': 'New Description',
            'event_type': self.event_type.id,
            'is_active': True
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Booking Flow')
    
    def test_update_flow(self):
        """Test updating a booking flow"""
        url = reverse('booking-flows-detail', args=[self.booking_flow.id])
        data = {
            'name': 'Updated Flow',
            'description': 'Updated Description'
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Flow')
    
    def test_delete_flow(self):
        """Test deleting a booking flow"""
        url = reverse('booking-flows-detail', args=[self.booking_flow.id])
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(BookingFlow.objects.count(), 0)
    
    def test_get_flow_steps(self):
        """Test getting steps for a flow"""
        url = reverse('booking-flows-steps', args=[self.booking_flow.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class BookingStepAPITests(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='admin@example.com',
            password='password',
            first_name='Admin',
            last_name='User',
            role='ADMIN'
        )
        
        # Create test event type
        self.event_type = EventType.objects.create(
            name='Test Event Type',
            description='Test Description',
            is_active=True
        )
        
        # Create API client and authenticate
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        # Create test booking flow
        self.booking_flow = BookingFlow.objects.create(
            name='Test Booking Flow',
            description='Test Description',
            event_type=self.event_type,
            is_active=True
        )
        
        # Create test steps
        self.step1 = BookingStep.objects.create(
            booking_flow=self.booking_flow,
            name='Step 1',
            step_type='INTRO',
            description='Step 1 Description',
            order=1,
            is_required=True,
            is_visible=True
        )
        
        self.step2 = BookingStep.objects.create(
            booking_flow=self.booking_flow,
            name='Step 2',
            step_type='DATE',
            description='Step 2 Description',
            order=2,
            is_required=True,
            is_visible=True
        )
        
        # Create test date config
        self.date_config = DateStepConfiguration.objects.create(
            step=self.step2,
            min_days_in_future=7,
            max_days_in_future=90,
            allow_time_selection=True
        )
    
    def test_list_steps(self):
        """Test listing booking steps"""
        url = reverse('booking-steps-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_retrieve_step(self):
        """Test retrieving a booking step"""
        url = reverse('booking-steps-detail', args=[self.step1.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Step 1')
    
    def test_create_step(self):
        """Test creating a booking step"""
        url = reverse('booking-steps-list')
        data = {
            'booking_flow': self.booking_flow.id,
            'name': 'New Step',
            'step_type': 'SUMMARY',
            'description': 'New Description',
            'order': 3,
            'is_required': True,
            'is_visible': True
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Step')
    
    def test_update_step(self):
        """Test updating a booking step"""
        url = reverse('booking-steps-detail', args=[self.step1.id])
        data = {
            'name': 'Updated Step',
            'description': 'Updated Description'
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Step')
    
    def test_delete_step(self):
        """Test deleting a booking step"""
        url = reverse('booking-steps-detail', args=[self.step1.id])
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(BookingStep.objects.count(), 1)
    
    def test_reorder_steps(self):
        """Test reordering steps"""
        url = reverse('booking-steps-reorder')
        data = {
            'flow_id': self.booking_flow.id,
            'order_mapping': {
                str(self.step1.id): 2,
                str(self.step2.id): 1
            }
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify order changed
        step1 = BookingStep.objects.get(id=self.step1.id)
        step2 = BookingStep.objects.get(id=self.step2.id)
        
        self.assertEqual(step1.order, 2)
        self.assertEqual(step2.order, 1)
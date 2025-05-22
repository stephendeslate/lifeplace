# backend/core/domains/bookingflow/tests.py
import json
from decimal import Decimal

from core.domains.events.models import EventType
from core.domains.products.models import ProductOption
from core.domains.questionnaires.models import Questionnaire
from core.domains.users.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from .exceptions import BookingFlowNotFound
from .models import (
    AddonConfiguration,
    AddonItem,
    BookingFlow,
    ConfirmationConfiguration,
    DateConfiguration,
    IntroConfiguration,
    PackageConfiguration,
    PackageItem,
    PaymentConfiguration,
    QuestionnaireConfiguration,
    QuestionnaireItem,
    SummaryConfiguration,
)
from .serializers import (
    AddonConfigurationSerializer,
    AddonItemSerializer,
    BookingFlowDetailSerializer,
    BookingFlowSerializer,
    ConfirmationConfigurationSerializer,
    DateConfigurationSerializer,
    IntroConfigurationSerializer,
    PackageConfigurationSerializer,
    PackageItemSerializer,
    PaymentConfigurationSerializer,
    QuestionnaireConfigurationSerializer,
    QuestionnaireItemSerializer,
    SummaryConfigurationSerializer,
)
from .services import BookingFlowService


class BookingFlowModelTestCase(TestCase):
    """Test cases for BookingFlow models"""

    def setUp(self):
        # Create test EventType for use in tests
        self.event_type = EventType.objects.create(
            name="Test Event Type",
            description="Test Description"
        )
        
        # Create a questionnaire for testing
        self.questionnaire = Questionnaire.objects.create(
            name="Test Questionnaire",
            event_type=self.event_type,
            is_active=True
        )
        
        # Create product options for testing
        self.product = ProductOption.objects.create(
            name="Test Package",
            description="Test package description",
            base_price=Decimal("100.00"),
            tax_rate=Decimal("10.00"),
            event_type=self.event_type,
            type="PACKAGE"
        )
        
        self.addon = ProductOption.objects.create(
            name="Test Addon",
            description="Test addon description",
            base_price=Decimal("50.00"),
            tax_rate=Decimal("10.00"),
            event_type=self.event_type,
            type="PRODUCT"
        )
        
        # Create a basic booking flow for testing
        self.booking_flow = BookingFlow.objects.create(
            name="Test Booking Flow",
            description="Test booking flow description",
            event_type=self.event_type,
            is_active=True
        )
        
        # Create an admin user for authentication
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            first_name='Admin',
            last_name='User',
            role='ADMIN'
        )
        
        # Set up API client with authentication
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin_user)

    def test_booking_flow_creation(self):
        """Test the creation of a BookingFlow instance"""
        self.assertEqual(self.booking_flow.name, "Test Booking Flow")
        self.assertEqual(self.booking_flow.description, "Test booking flow description")
        self.assertEqual(self.booking_flow.event_type, self.event_type)
        self.assertTrue(self.booking_flow.is_active)
        self.assertIsNotNone(self.booking_flow.created_at)
        self.assertIsNotNone(self.booking_flow.updated_at)
        self.assertEqual(str(self.booking_flow), "Test Booking Flow for Test Event Type")

    def test_intro_configuration(self):
        """Test IntroConfiguration creation and relationship with BookingFlow"""
        intro_config = IntroConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Introduction",
            description="Welcome to the booking process",
            show_event_details=True,
            is_required=True,
            is_visible=True
        )
        
        self.assertEqual(intro_config.booking_flow, self.booking_flow)
        self.assertEqual(intro_config.title, "Introduction")
        self.assertEqual(str(intro_config), f"Intro config for {self.booking_flow.name}")

    def test_date_configuration(self):
        """Test DateConfiguration creation and relationship with BookingFlow"""
        date_config = DateConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Select Date",
            description="Choose your event date",
            min_days_in_future=1,
            max_days_in_future=365,
            allow_time_selection=True,
            buffer_before_event=30,
            buffer_after_event=30,
            allow_multi_day=False,
            is_required=True,
            is_visible=True
        )
        
        self.assertEqual(date_config.booking_flow, self.booking_flow)
        self.assertEqual(date_config.title, "Select Date")
        self.assertEqual(date_config.min_days_in_future, 1)
        self.assertEqual(date_config.max_days_in_future, 365)
        self.assertEqual(str(date_config), f"Date config for {self.booking_flow.name}")

    def test_questionnaire_configuration(self):
        """Test QuestionnaireConfiguration creation and relationship with BookingFlow"""
        questionnaire_config = QuestionnaireConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Questionnaire",
            description="Please answer these questions",
            is_required=True,
            is_visible=True
        )
        
        questionnaire_item = QuestionnaireItem.objects.create(
            config=questionnaire_config,
            questionnaire=self.questionnaire,
            order=1,
            is_required=True
        )
        
        self.assertEqual(questionnaire_config.booking_flow, self.booking_flow)
        self.assertEqual(questionnaire_config.title, "Questionnaire")
        self.assertEqual(str(questionnaire_config), f"Questionnaire config for {self.booking_flow.name}")
        
        self.assertEqual(questionnaire_item.config, questionnaire_config)
        self.assertEqual(questionnaire_item.questionnaire, self.questionnaire)
        self.assertEqual(questionnaire_item.order, 1)
        self.assertEqual(
            str(questionnaire_item), 
            f"{self.questionnaire.name} (Order {questionnaire_item.order}) - {self.booking_flow.name}"
        )

    def test_package_configuration(self):
        """Test PackageConfiguration creation and relationship with BookingFlow"""
        package_config = PackageConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Select Package",
            description="Choose your package",
            min_selection=1,
            max_selection=1,
            selection_type="SINGLE",
            is_required=True,
            is_visible=True
        )
        
        package_item = PackageItem.objects.create(
            config=package_config,
            product=self.product,
            order=1,
            is_highlighted=True,
            custom_price=Decimal("90.00"),
            custom_description="Custom package description"
        )
        
        self.assertEqual(package_config.booking_flow, self.booking_flow)
        self.assertEqual(package_config.title, "Select Package")
        self.assertEqual(str(package_config), f"Package config for {self.booking_flow.name}")
        
        self.assertEqual(package_item.config, package_config)
        self.assertEqual(package_item.product, self.product)
        self.assertEqual(package_item.order, 1)
        self.assertTrue(package_item.is_highlighted)
        self.assertEqual(package_item.custom_price, Decimal("90.00"))
        self.assertEqual(
            str(package_item), 
            f"{self.product.name} (Order {package_item.order}) - {self.booking_flow.name}"
        )

    def test_addon_configuration(self):
        """Test AddonConfiguration creation and relationship with BookingFlow"""
        addon_config = AddonConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Select Add-ons",
            description="Choose optional add-ons",
            min_selection=0,
            max_selection=5,
            is_required=False,
            is_visible=True
        )
        
        addon_item = AddonItem.objects.create(
            config=addon_config,
            product=self.addon,
            order=1,
            is_highlighted=False,
            custom_price=Decimal("45.00"),
            custom_description="Custom addon description"
        )
        
        self.assertEqual(addon_config.booking_flow, self.booking_flow)
        self.assertEqual(addon_config.title, "Select Add-ons")
        self.assertEqual(str(addon_config), f"Addon config for {self.booking_flow.name}")
        
        self.assertEqual(addon_item.config, addon_config)
        self.assertEqual(addon_item.product, self.addon)
        self.assertEqual(addon_item.order, 1)
        self.assertFalse(addon_item.is_highlighted)
        self.assertEqual(addon_item.custom_price, Decimal("45.00"))
        self.assertEqual(
            str(addon_item), 
            f"{self.addon.name} (Order {addon_item.order}) - {self.booking_flow.name}"
        )

    def test_summary_configuration(self):
        """Test SummaryConfiguration creation and relationship with BookingFlow"""
        summary_config = SummaryConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Review Your Booking",
            description="Please review your booking details",
            show_date=True,
            show_packages=True,
            show_addons=True,
            show_questionnaire=True,
            show_total=True,
            is_required=True,
            is_visible=True
        )
        
        self.assertEqual(summary_config.booking_flow, self.booking_flow)
        self.assertEqual(summary_config.title, "Review Your Booking")
        self.assertEqual(str(summary_config), f"Summary config for {self.booking_flow.name}")

    def test_payment_configuration(self):
        """Test PaymentConfiguration creation and relationship with BookingFlow"""
        payment_config = PaymentConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Payment",
            description="Complete your payment",
            require_deposit=True,
            deposit_percentage=50,
            accept_credit_card=True,
            accept_paypal=True,
            accept_bank_transfer=False,
            payment_instructions="Please pay with credit card or PayPal",
            is_required=True,
            is_visible=True
        )
        
        self.assertEqual(payment_config.booking_flow, self.booking_flow)
        self.assertEqual(payment_config.title, "Payment")
        self.assertTrue(payment_config.require_deposit)
        self.assertEqual(payment_config.deposit_percentage, 50)
        self.assertEqual(str(payment_config), f"Payment config for {self.booking_flow.name}")

    def test_confirmation_configuration(self):
        """Test ConfirmationConfiguration creation and relationship with BookingFlow"""
        confirmation_config = ConfirmationConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Booking Confirmed",
            description="Your booking is confirmed",
            success_message="Thank you for your booking!",
            send_email=True,
            email_template="confirmation_email",
            show_summary=True,
            is_visible=True
        )
        
        self.assertEqual(confirmation_config.booking_flow, self.booking_flow)
        self.assertEqual(confirmation_config.title, "Booking Confirmed")
        self.assertEqual(confirmation_config.success_message, "Thank you for your booking!")
        self.assertEqual(str(confirmation_config), f"Confirmation config for {self.booking_flow.name}")


class BookingFlowSerializerTestCase(TestCase):
    """Test cases for BookingFlow serializers"""

    def setUp(self):
        # Create test EventType for use in tests
        self.event_type = EventType.objects.create(
            name="Test Event Type",
            description="Test Description"
        )
        
        # Create a questionnaire for testing
        self.questionnaire = Questionnaire.objects.create(
            name="Test Questionnaire",
            event_type=self.event_type,
            is_active=True
        )
        
        # Create product options for testing
        self.product = ProductOption.objects.create(
            name="Test Package",
            description="Test package description",
            base_price=Decimal("100.00"),
            tax_rate=Decimal("10.00"),
            event_type=self.event_type,
            type="PACKAGE"
        )
        
        self.addon = ProductOption.objects.create(
            name="Test Addon",
            description="Test addon description",
            base_price=Decimal("50.00"),
            tax_rate=Decimal("10.00"),
            event_type=self.event_type,
            type="PRODUCT"
        )
        
        # Create a basic booking flow for testing
        self.booking_flow = BookingFlow.objects.create(
            name="Test Booking Flow",
            description="Test booking flow description",
            event_type=self.event_type,
            is_active=True
        )
        
        # Create all configurations
        self.intro_config = IntroConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Introduction",
            description="Welcome to the booking process",
            show_event_details=True,
            is_required=True,
            is_visible=True
        )
        
        self.date_config = DateConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Select Date",
            description="Choose your event date",
            min_days_in_future=1,
            max_days_in_future=365,
            allow_time_selection=True,
            buffer_before_event=30,
            buffer_after_event=30,
            allow_multi_day=False,
            is_required=True,
            is_visible=True
        )
        
        self.questionnaire_config = QuestionnaireConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Questionnaire",
            description="Please answer these questions",
            is_required=True,
            is_visible=True
        )
        
        self.questionnaire_item = QuestionnaireItem.objects.create(
            config=self.questionnaire_config,
            questionnaire=self.questionnaire,
            order=1,
            is_required=True
        )
        
        self.package_config = PackageConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Select Package",
            description="Choose your package",
            min_selection=1,
            max_selection=1,
            selection_type="SINGLE",
            is_required=True,
            is_visible=True
        )
        
        self.package_item = PackageItem.objects.create(
            config=self.package_config,
            product=self.product,
            order=1,
            is_highlighted=True,
            custom_price=Decimal("90.00"),
            custom_description="Custom package description"
        )
        
        self.addon_config = AddonConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Select Add-ons",
            description="Choose optional add-ons",
            min_selection=0,
            max_selection=5,
            is_required=False,
            is_visible=True
        )
        
        self.addon_item = AddonItem.objects.create(
            config=self.addon_config,
            product=self.addon,
            order=1,
            is_highlighted=False,
            custom_price=Decimal("45.00"),
            custom_description="Custom addon description"
        )
        
        self.summary_config = SummaryConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Review Your Booking",
            description="Please review your booking details",
            show_date=True,
            show_packages=True,
            show_addons=True,
            show_questionnaire=True,
            show_total=True,
            is_required=True,
            is_visible=True
        )
        
        self.payment_config = PaymentConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Payment",
            description="Complete your payment",
            require_deposit=True,
            deposit_percentage=50,
            accept_credit_card=True,
            accept_paypal=True,
            accept_bank_transfer=False,
            payment_instructions="Please pay with credit card or PayPal",
            is_required=True,
            is_visible=True
        )
        
        self.confirmation_config = ConfirmationConfiguration.objects.create(
            booking_flow=self.booking_flow,
            title="Booking Confirmed",
            description="Your booking is confirmed",
            success_message="Thank you for your booking!",
            send_email=True,
            email_template="confirmation_email",
            show_summary=True,
            is_visible=True
        )

    def test_booking_flow_serializer(self):
        """Test BookingFlowSerializer serialization"""
        serializer = BookingFlowSerializer(self.booking_flow)
        data = serializer.data
        
        self.assertEqual(data['name'], "Test Booking Flow")
        self.assertEqual(data['description'], "Test booking flow description")
        self.assertEqual(data['event_type'], self.event_type.id)
        self.assertTrue(data['is_active'])
        self.assertIn('event_type_details', data)
        self.assertEqual(data['event_type_details']['name'], "Test Event Type")

    def test_booking_flow_detail_serializer(self):
        """Test BookingFlowDetailSerializer serialization"""
        serializer = BookingFlowDetailSerializer(self.booking_flow)
        data = serializer.data
        
        # Check main booking flow fields
        self.assertEqual(data['name'], "Test Booking Flow")
        self.assertEqual(data['description'], "Test booking flow description")
        
        # Check intro configuration
        self.assertIn('intro_config', data)
        self.assertEqual(data['intro_config']['title'], "Introduction")
        
        # Check date configuration
        self.assertIn('date_config', data)
        self.assertEqual(data['date_config']['title'], "Select Date")
        self.assertEqual(data['date_config']['min_days_in_future'], 1)
        
        # Check questionnaire configuration
        self.assertIn('questionnaire_config', data)
        self.assertEqual(data['questionnaire_config']['title'], "Questionnaire")
        self.assertIn('questionnaire_items', data['questionnaire_config'])
        self.assertEqual(len(data['questionnaire_config']['questionnaire_items']), 1)
        
        # Check package configuration
        self.assertIn('package_config', data)
        self.assertEqual(data['package_config']['title'], "Select Package")
        self.assertIn('package_items', data['package_config'])
        self.assertEqual(len(data['package_config']['package_items']), 1)
        self.assertEqual(data['package_config']['package_items'][0]['product'], self.product.id)
        self.assertEqual(
            data['package_config']['package_items'][0]['custom_price'], 
            '90.00'  # Decimal is serialized as string
        )
        
        # Check addon configuration
        self.assertIn('addon_config', data)
        self.assertEqual(data['addon_config']['title'], "Select Add-ons")
        self.assertIn('addon_items', data['addon_config'])
        self.assertEqual(len(data['addon_config']['addon_items']), 1)
        
        # Check summary configuration
        self.assertIn('summary_config', data)
        self.assertEqual(data['summary_config']['title'], "Review Your Booking")
        self.assertTrue(data['summary_config']['show_date'])
        self.assertTrue(data['summary_config']['show_packages'])
        
        # Check payment configuration
        self.assertIn('payment_config', data)
        self.assertEqual(data['payment_config']['title'], "Payment")
        self.assertTrue(data['payment_config']['require_deposit'])
        self.assertEqual(data['payment_config']['deposit_percentage'], 50)
        
        # Check confirmation configuration
        self.assertIn('confirmation_config', data)
        self.assertEqual(data['confirmation_config']['title'], "Booking Confirmed")
        self.assertEqual(data['confirmation_config']['success_message'], "Thank you for your booking!")

    def test_intro_configuration_serializer(self):
        """Test IntroConfigurationSerializer serialization"""
        serializer = IntroConfigurationSerializer(self.intro_config)
        data = serializer.data
        
        self.assertEqual(data['title'], "Introduction")
        self.assertEqual(data['description'], "Welcome to the booking process")
        self.assertTrue(data['show_event_details'])
        self.assertTrue(data['is_required'])
        self.assertTrue(data['is_visible'])

    def test_date_configuration_serializer(self):
        """Test DateConfigurationSerializer serialization"""
        serializer = DateConfigurationSerializer(self.date_config)
        data = serializer.data
        
        self.assertEqual(data['title'], "Select Date")
        self.assertEqual(data['description'], "Choose your event date")
        self.assertEqual(data['min_days_in_future'], 1)
        self.assertEqual(data['max_days_in_future'], 365)
        self.assertTrue(data['allow_time_selection'])
        self.assertEqual(data['buffer_before_event'], 30)
        self.assertEqual(data['buffer_after_event'], 30)
        self.assertFalse(data['allow_multi_day'])
        self.assertTrue(data['is_required'])
        self.assertTrue(data['is_visible'])

    def test_questionnaire_configuration_serializer(self):
        """Test QuestionnaireConfigurationSerializer serialization"""
        serializer = QuestionnaireConfigurationSerializer(self.questionnaire_config)
        data = serializer.data
        
        self.assertEqual(data['title'], "Questionnaire")
        self.assertEqual(data['description'], "Please answer these questions")
        self.assertTrue(data['is_required'])
        self.assertTrue(data['is_visible'])
        self.assertIn('questionnaire_items', data)
        self.assertEqual(len(data['questionnaire_items']), 1)
        self.assertEqual(data['questionnaire_items'][0]['questionnaire'], self.questionnaire.id)
        self.assertTrue(data['questionnaire_items'][0]['is_required'])

    def test_package_configuration_serializer(self):
        """Test PackageConfigurationSerializer serialization"""
        serializer = PackageConfigurationSerializer(self.package_config)
        data = serializer.data
        
        self.assertEqual(data['title'], "Select Package")
        self.assertEqual(data['description'], "Choose your package")
        self.assertEqual(data['min_selection'], 1)
        self.assertEqual(data['max_selection'], 1)
        self.assertEqual(data['selection_type'], "SINGLE")
        self.assertTrue(data['is_required'])
        self.assertTrue(data['is_visible'])
        self.assertIn('package_items', data)
        self.assertEqual(len(data['package_items']), 1)
        self.assertEqual(data['package_items'][0]['product'], self.product.id)
        self.assertTrue(data['package_items'][0]['is_highlighted'])
        self.assertEqual(data['package_items'][0]['custom_price'], '90.00')
        self.assertEqual(data['package_items'][0]['custom_description'], "Custom package description")

    def test_addon_configuration_serializer(self):
        """Test AddonConfigurationSerializer serialization"""
        serializer = AddonConfigurationSerializer(self.addon_config)
        data = serializer.data
        
        self.assertEqual(data['title'], "Select Add-ons")
        self.assertEqual(data['description'], "Choose optional add-ons")
        self.assertEqual(data['min_selection'], 0)
        self.assertEqual(data['max_selection'], 5)
        self.assertFalse(data['is_required'])
        self.assertTrue(data['is_visible'])
        self.assertIn('addon_items', data)
        self.assertEqual(len(data['addon_items']), 1)
        self.assertEqual(data['addon_items'][0]['product'], self.addon.id)
        self.assertFalse(data['addon_items'][0]['is_highlighted'])
        self.assertEqual(data['addon_items'][0]['custom_price'], '45.00')
        self.assertEqual(data['addon_items'][0]['custom_description'], "Custom addon description")

    def test_summary_configuration_serializer(self):
        """Test SummaryConfigurationSerializer serialization"""
        serializer = SummaryConfigurationSerializer(self.summary_config)
        data = serializer.data
        
        self.assertEqual(data['title'], "Review Your Booking")
        self.assertEqual(data['description'], "Please review your booking details")
        self.assertTrue(data['show_date'])
        self.assertTrue(data['show_packages'])
        self.assertTrue(data['show_addons'])
        self.assertTrue(data['show_questionnaire'])
        self.assertTrue(data['show_total'])
        self.assertTrue(data['is_required'])
        self.assertTrue(data['is_visible'])

    def test_payment_configuration_serializer(self):
        """Test PaymentConfigurationSerializer serialization"""
        serializer = PaymentConfigurationSerializer(self.payment_config)
        data = serializer.data
        
        self.assertEqual(data['title'], "Payment")
        self.assertEqual(data['description'], "Complete your payment")
        self.assertTrue(data['require_deposit'])
        self.assertEqual(data['deposit_percentage'], 50)
        self.assertTrue(data['accept_credit_card'])
        self.assertTrue(data['accept_paypal'])
        self.assertFalse(data['accept_bank_transfer'])
        self.assertEqual(data['payment_instructions'], "Please pay with credit card or PayPal")
        self.assertTrue(data['is_required'])
        self.assertTrue(data['is_visible'])

    def test_confirmation_configuration_serializer(self):
        """Test ConfirmationConfigurationSerializer serialization"""
        serializer = ConfirmationConfigurationSerializer(self.confirmation_config)
        data = serializer.data
        
        self.assertEqual(data['title'], "Booking Confirmed")
        self.assertEqual(data['description'], "Your booking is confirmed")
        self.assertEqual(data['success_message'], "Thank you for your booking!")
        self.assertTrue(data['send_email'])
        self.assertEqual(data['email_template'], "confirmation_email")
        self.assertTrue(data['show_summary'])
        self.assertTrue(data['is_visible'])


class BookingFlowServiceTestCase(TestCase):
    """Test cases for BookingFlowService"""

    def setUp(self):
        # Create test EventType for use in tests
        self.event_type1 = EventType.objects.create(
            name="Wedding",
            description="Wedding events"
        )
        
        self.event_type2 = EventType.objects.create(
            name="Corporate",
            description="Corporate events"
        )
        
        # Create a questionnaire for testing
        self.questionnaire = Questionnaire.objects.create(
            name="Test Questionnaire",
            event_type=self.event_type1,
            is_active=True
        )
        
        # Create product options for testing
        self.product = ProductOption.objects.create(
            name="Premium Package",
            description="Premium package description",
            base_price=Decimal("1000.00"),
            tax_rate=Decimal("10.00"),
            event_type=self.event_type1,
            type="PACKAGE"
        )
        
        self.addon = ProductOption.objects.create(
            name="Extra Hour",
            description="Extra hour of service",
            base_price=Decimal("100.00"),
            tax_rate=Decimal("10.00"),
            event_type=self.event_type1,
            type="PRODUCT"
        )
        
        # Create test booking flows
        self.wedding_flow = BookingFlow.objects.create(
            name="Wedding Booking",
            description="Wedding booking flow",
            event_type=self.event_type1,
            is_active=True
        )
        
        self.corporate_flow = BookingFlow.objects.create(
            name="Corporate Booking",
            description="Corporate booking flow",
            event_type=self.event_type2,
            is_active=False
        )

    def test_get_all_flows(self):
        """Test get_all_flows method of BookingFlowService"""
        # Get all flows
        flows = BookingFlowService.get_all_flows()
        self.assertEqual(flows.count(), 2)
        
        # Test filtering by event_type
        wedding_flows = BookingFlowService.get_all_flows(event_type_id=self.event_type1.id)
        self.assertEqual(wedding_flows.count(), 1)
        self.assertEqual(wedding_flows.first(), self.wedding_flow)
        
        # Test filtering by is_active
        active_flows = BookingFlowService.get_all_flows(is_active=True)
        self.assertEqual(active_flows.count(), 1)
        self.assertEqual(active_flows.first(), self.wedding_flow)
        
        # Test search query
        corporate_flows = BookingFlowService.get_all_flows(search_query="Corporate")
        self.assertEqual(corporate_flows.count(), 1)
        self.assertEqual(corporate_flows.first(), self.corporate_flow)

    def test_get_flow_by_id(self):
        """Test get_flow_by_id method of BookingFlowService"""
        # Get existing flow
        flow = BookingFlowService.get_flow_by_id(self.wedding_flow.id)
        self.assertEqual(flow, self.wedding_flow)
        
        # Test with non-existent ID
        with self.assertRaises(BookingFlowNotFound):
            BookingFlowService.get_flow_by_id(9999)

    def test_create_flow(self):
        """Test create_flow method of BookingFlowService"""
        # Prepare test data
        flow_data = {
            'name': 'Portrait Session',
            'description': 'Portrait photo session booking flow',
            'event_type': self.event_type1,
            'is_active': True,
            'intro_config': {
                'title': 'Portrait Session Booking',
                'description': 'Book your portrait session',
                'show_event_details': True
            },
            'date_config': {
                'title': 'Select Session Date',
                'description': 'Choose your session date and time',
                'min_days_in_future': 3,
                'max_days_in_future': 90
            },
            'questionnaire_config': {
                'title': 'Session Information',
                'description': 'Tell us about your session',
                'questionnaire_items': [
                    {
                        'questionnaire': self.questionnaire.id,
                        'is_required': True
                    }
                ]
            },
            'package_config': {
                'title': 'Select Package',
                'description': 'Choose your portrait package',
                'package_items': [
                    {
                        'product': self.product.id,
                        'is_highlighted': True
                    }
                ]
            },
            'addon_config': {
                'title': 'Select Add-ons',
                'description': 'Choose optional add-ons',
                'addon_items': [
                    {
                        'product': self.addon.id,
                        'is_highlighted': False
                    }
                ]
            }
        }
        
        # Create flow
        flow = BookingFlowService.create_flow(flow_data)
        
        # Verify main flow
        self.assertEqual(flow.name, 'Portrait Session')
        self.assertEqual(flow.description, 'Portrait photo session booking flow')
        self.assertEqual(flow.event_type, self.event_type1)
        self.assertTrue(flow.is_active)
        
        # Verify intro configuration
        self.assertTrue(hasattr(flow, 'intro_config'))
        self.assertEqual(flow.intro_config.title, 'Portrait Session Booking')
        
        # Verify date configuration
        self.assertTrue(hasattr(flow, 'date_config'))
        self.assertEqual(flow.date_config.title, 'Select Session Date')
        self.assertEqual(flow.date_config.min_days_in_future, 3)
        
        # Verify questionnaire configuration
        self.assertTrue(hasattr(flow, 'questionnaire_config'))
        self.assertEqual(flow.questionnaire_config.title, 'Session Information')
        self.assertEqual(flow.questionnaire_config.questionnaire_items.count(), 1)
        self.assertEqual(
            flow.questionnaire_config.questionnaire_items.first().questionnaire, 
            self.questionnaire
        )
        
        # Verify package configuration
        self.assertTrue(hasattr(flow, 'package_config'))
        self.assertEqual(flow.package_config.title, 'Select Package')
        self.assertEqual(flow.package_config.package_items.count(), 1)
        self.assertEqual(
            flow.package_config.package_items.first().product, 
            self.product
        )
        
        # Verify addon configuration
        self.assertTrue(hasattr(flow, 'addon_config'))
        self.assertEqual(flow.addon_config.title, 'Select Add-ons')
        self.assertEqual(flow.addon_config.addon_items.count(), 1)
        self.assertEqual(
            flow.addon_config.addon_items.first().product, 
            self.addon
        )
        
        # Verify default configurations were created for all steps
        self.assertTrue(hasattr(flow, 'summary_config'))
        self.assertTrue(hasattr(flow, 'payment_config'))
        self.assertTrue(hasattr(flow, 'confirmation_config'))

    def test_update_flow(self):
        """Test update_flow method of BookingFlowService"""
        # Create intro config for the flow
        IntroConfiguration.objects.create(
            booking_flow=self.wedding_flow,
            title="Wedding Booking",
            description="Book your wedding",
            show_event_details=True,
            is_required=True,
            is_visible=True
        )
        
        # Prepare update data
        update_data = {
            'name': 'Premium Wedding Booking',
            'description': 'Premium wedding photography booking flow',
            'is_active': True,
            'intro_config': {
                'title': 'Premium Wedding Booking',
                'description': 'Book your premium wedding package',
                'show_event_details': False
            }
        }
        
        # Update flow
        updated_flow = BookingFlowService.update_flow(self.wedding_flow.id, update_data)
        
        # Verify updates
        self.assertEqual(updated_flow.name, 'Premium Wedding Booking')
        self.assertEqual(updated_flow.description, 'Premium wedding photography booking flow')
        self.assertEqual(updated_flow.intro_config.title, 'Premium Wedding Booking')
        self.assertEqual(updated_flow.intro_config.description, 'Book your premium wedding package')
        self.assertFalse(updated_flow.intro_config.show_event_details)
        
        # Verify event_type didn't change
        self.assertEqual(updated_flow.event_type, self.event_type1)

    def test_delete_flow(self):
        """Test delete_flow method of BookingFlowService"""
        # Create some configurations for the flow
        IntroConfiguration.objects.create(
            booking_flow=self.wedding_flow,
            title="Wedding Booking",
            description="Book your wedding",
            show_event_details=True,
            is_required=True,
            is_visible=True
        )
        
        DateConfiguration.objects.create(
            booking_flow=self.wedding_flow,
            title="Select Date",
            description="Choose your wedding date",
            min_days_in_future=30,
            max_days_in_future=365,
            allow_time_selection=True,
            is_required=True,
            is_visible=True
        )
        
        # Verify configurations exist
        self.assertEqual(IntroConfiguration.objects.filter(booking_flow=self.wedding_flow).count(), 1)
        self.assertEqual(DateConfiguration.objects.filter(booking_flow=self.wedding_flow).count(), 1)
        
        # Delete flow
        result = BookingFlowService.delete_flow(self.wedding_flow.id)
        self.assertTrue(result)
        
        # Verify flow and configurations are deleted
        with self.assertRaises(BookingFlow.DoesNotExist):
            BookingFlow.objects.get(id=self.wedding_flow.id)
        
        self.assertEqual(IntroConfiguration.objects.filter(booking_flow=self.wedding_flow).count(), 0)
        self.assertEqual(DateConfiguration.objects.filter(booking_flow=self.wedding_flow).count(), 0)


class BookingFlowAPITestCase(APITestCase):
    """Test cases for BookingFlow API endpoints"""

    def setUp(self):
        # Create test EventType for use in tests
        self.event_type1 = EventType.objects.create(
            name="Wedding",
            description="Wedding events"
        )
        
        self.event_type2 = EventType.objects.create(
            name="Corporate",
            description="Corporate events"
        )
        
        # Create a questionnaire for testing
        self.questionnaire = Questionnaire.objects.create(
            name="Test Questionnaire",
            event_type=self.event_type1,
            is_active=True
        )
        
        # Create product options for testing
        self.product = ProductOption.objects.create(
            name="Premium Package",
            description="Premium package description",
            base_price=Decimal("1000.00"),
            tax_rate=Decimal("10.00"),
            event_type=self.event_type1,
            type="PACKAGE"
        )
        
        self.addon = ProductOption.objects.create(
            name="Extra Hour",
            description="Extra hour of service",
            base_price=Decimal("100.00"),
            tax_rate=Decimal("10.00"),
            event_type=self.event_type1,
            type="PRODUCT"
        )
        
        # Create test booking flow
        self.wedding_flow = BookingFlow.objects.create(
            name="Wedding Booking",
            description="Wedding booking flow",
            event_type=self.event_type1,
            is_active=True
        )
        
        # Create configurations
        self.intro_config = IntroConfiguration.objects.create(
            booking_flow=self.wedding_flow,
            title="Wedding Booking",
            description="Book your wedding",
            show_event_details=True,
            is_required=True,
            is_visible=True
        )
        
        # Create an admin user for authentication
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            first_name='Admin',
            last_name='User',
            role='ADMIN'
        )
        
        # Set up API client with authentication
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin_user)
        
        # URLs
        self.list_url = reverse('booking-flows-list')
        self.detail_url = reverse('booking-flows-detail', args=[self.wedding_flow.id])
        self.active_url = reverse('booking-flows-active')
        self.intro_config_url = reverse('booking-flows-intro-config', args=[self.wedding_flow.id])

    def test_list_booking_flows(self):
        """Test listing booking flows"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['name'], "Wedding Booking")

    def test_get_booking_flow_detail(self):
        """Test retrieving booking flow detail"""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Wedding Booking")
        self.assertEqual(response.data['event_type'], self.event_type1.id)
        self.assertIn('intro_config', response.data)
        self.assertEqual(response.data['intro_config']['title'], "Wedding Booking")

    def test_create_booking_flow(self):
        """Test creating booking flow"""
        data = {
            "name": "Portrait Session",
            "description": "Portrait session booking flow",
            "event_type": self.event_type2.id,
            "is_active": True
        }
        
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], "Portrait Session")
        self.assertEqual(response.data['event_type'], self.event_type2.id)
        
        # Verify all configurations are created
        self.assertIn('intro_config', response.data)
        self.assertIn('date_config', response.data)
        self.assertIn('questionnaire_config', response.data)
        self.assertIn('package_config', response.data)
        self.assertIn('addon_config', response.data)
        self.assertIn('summary_config', response.data)
        self.assertIn('payment_config', response.data)
        self.assertIn('confirmation_config', response.data)

    def test_update_booking_flow(self):
        """Test updating booking flow"""
        data = {
            "name": "Luxury Wedding Booking",
            "description": "Luxury wedding booking flow",
            "is_active": True
        }
        
        response = self.client.patch(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Luxury Wedding Booking")
        self.assertEqual(response.data['description'], "Luxury wedding booking flow")

    def test_delete_booking_flow(self):
        """Test deleting booking flow"""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify flow is deleted
        self.assertEqual(BookingFlow.objects.filter(id=self.wedding_flow.id).count(), 0)

    def test_active_booking_flows(self):
        """Test listing active booking flows"""
        # Create an inactive flow
        BookingFlow.objects.create(
            name="Inactive Flow",
            description="Inactive flow",
            event_type=self.event_type1,
            is_active=False
        )
        
        response = self.client.get(self.active_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)  # Only the active flow
        self.assertEqual(response.data['results'][0]['name'], "Wedding Booking")

    def test_get_intro_config(self):
        """Test getting intro configuration"""
        response = self.client.get(self.intro_config_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Wedding Booking")
        self.assertEqual(response.data['description'], "Book your wedding")
        self.assertTrue(response.data['show_event_details'])

    def test_update_intro_config(self):
        """Test updating intro configuration"""
        data = {
            "title": "Elegant Wedding Booking",
            "description": "Book your elegant wedding package",
            "show_event_details": False
        }
        
        response = self.client.patch(self.intro_config_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Elegant Wedding Booking")
        self.assertEqual(response.data['description'], "Book your elegant wedding package")
        self.assertFalse(response.data['show_event_details'])
        
        # Verify database was updated
        updated_config = IntroConfiguration.objects.get(booking_flow=self.wedding_flow)
        self.assertEqual(updated_config.title, "Elegant Wedding Booking")
        self.assertFalse(updated_config.show_event_details)

    def test_create_config_if_not_exists(self):
        """Test creating configuration if it doesn't exist"""
        # Delete existing intro config
        self.intro_config.delete()
        
        data = {
            "title": "New Wedding Booking",
            "description": "Book your wedding package",
            "show_event_details": True
        }
        
        response = self.client.put(self.intro_config_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], "New Wedding Booking")
        
        # Verify configuration was created
        new_config = IntroConfiguration.objects.get(booking_flow=self.wedding_flow)
        self.assertEqual(new_config.title, "New Wedding Booking")
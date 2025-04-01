# backend/core/domains/dashboard/tests.py
from datetime import datetime, timedelta
from unittest.mock import patch

from core.domains.events.models import Event
from core.domains.payments.models import Payment
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from .models import DashboardPreference
from .services import DashboardService

User = get_user_model()


class DashboardServiceTestCase(TestCase):
    """Test case for the dashboard service functions"""
    
    def setUp(self):
        # Create test user (admin)
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            first_name='Admin',
            last_name='User',
            role='ADMIN'
        )
        
        # Create some client users
        self.client_user1 = User.objects.create_user(
            email='client1@example.com',
            password='password123',
            first_name='Client',
            last_name='One',
            role='CLIENT'
        )
        
        self.client_user2 = User.objects.create_user(
            email='client2@example.com',
            password='password123',
            first_name='Client',
            last_name='Two',
            role='CLIENT'
        )
        
        # Set dates for testing
        self.today = timezone.now().date()
        self.yesterday = self.today - timedelta(days=1)
        self.week_ago = self.today - timedelta(days=7)
        self.month_ago = self.today.replace(day=1)
        if self.month_ago > self.today - timedelta(days=28):
            # Go to previous month if we're at the start of the month
            prev_month = self.month_ago - timedelta(days=1)
            self.month_ago = prev_month.replace(day=1)
    
    def test_get_date_range(self):
        """Test getting date ranges for different time ranges"""
        # Test day range
        start_date, end_date = DashboardService.get_date_range('day')
        self.assertEqual(start_date, self.today)
        self.assertEqual(end_date, self.today)
        
        # Test week range
        start_date, end_date = DashboardService.get_date_range('week')
        self.assertEqual(end_date, self.today)
        self.assertEqual(start_date, self.today - timedelta(days=self.today.weekday()))
        
        # Test month range
        start_date, end_date = DashboardService.get_date_range('month')
        self.assertEqual(end_date, self.today)
        self.assertEqual(start_date, self.today.replace(day=1))
        
        # Test invalid range
        with self.assertRaises(Exception):
            DashboardService.get_date_range('invalid')
    
    def test_calculate_percentage_change(self):
        """Test percentage change calculation"""
        # Test positive change
        change = DashboardService.calculate_percentage_change(100, 50)
        self.assertEqual(change, 100.0)
        
        # Test negative change
        change = DashboardService.calculate_percentage_change(50, 100)
        self.assertEqual(change, -50.0)
        
        # Test no change
        change = DashboardService.calculate_percentage_change(100, 100)
        self.assertEqual(change, 0.0)
        
        # Test with zero previous value
        change = DashboardService.calculate_percentage_change(100, 0)
        self.assertIsNone(change)
        
        # Test with None previous value
        change = DashboardService.calculate_percentage_change(100, None)
        self.assertIsNone(change)
    
    def test_previous_period(self):
        """Test getting previous period dates"""
        # Test for a one-day period
        start_date = self.today
        end_date = self.today
        prev_start, prev_end = DashboardService.get_previous_period(start_date, end_date)
        
        self.assertEqual(prev_end, self.yesterday)
        self.assertEqual(prev_start, self.yesterday)
        
        # Test for a week period
        start_date = self.today - timedelta(days=6)
        end_date = self.today
        prev_start, prev_end = DashboardService.get_previous_period(start_date, end_date)
        
        self.assertEqual(prev_end, start_date - timedelta(days=1))
        self.assertEqual(prev_start, prev_end - timedelta(days=6))


class DashboardPreferenceModelTestCase(TestCase):
    """Test case for the DashboardPreference model"""
    
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User',
            role='ADMIN'
        )
    
    def test_create_preference(self):
        """Test creating a dashboard preference"""
        # Create with default layout
        preference = DashboardPreference.objects.create(
            user=self.user,
            layout=DashboardPreference.get_default_layout(),
            default_time_range='month'
        )
        
        self.assertEqual(preference.user, self.user)
        self.assertEqual(preference.default_time_range, 'month')
        self.assertIn('widgets', preference.layout)
        self.assertIn('layout', preference.layout)
    
    def test_enabled_widgets(self):
        """Test getting enabled widgets"""
        layout = {
            "widgets": ["widget1", "widget2"],
            "layout": {
                "widget1": {"position": 1},
                "widget2": {"position": 2}
            }
        }
        
        preference = DashboardPreference.objects.create(
            user=self.user,
            layout=layout
        )
        
        enabled_widgets = preference.enabled_widgets
        self.assertEqual(enabled_widgets, ["widget1", "widget2"])
    
    def test_widget_layout(self):
        """Test getting widget layout"""
        layout = {
            "widgets": ["widget1", "widget2"],
            "layout": {
                "widget1": {"position": 1},
                "widget2": {"position": 2}
            }
        }
        
        preference = DashboardPreference.objects.create(
            user=self.user,
            layout=layout
        )
        
        widget_layout = preference.widget_layout
        self.assertEqual(widget_layout, {
            "widget1": {"position": 1},
            "widget2": {"position": 2}
        })
    
    def test_get_default_layout(self):
        """Test getting default layout"""
        default_layout = DashboardPreference.get_default_layout()
        
        self.assertIn('widgets', default_layout)
        self.assertIn('layout', default_layout)
        
        # Check that all widgets in the 'widgets' list have a layout configuration
        for widget in default_layout['widgets']:
            self.assertIn(widget, default_layout['layout'])


class DashboardAPITestCase(TestCase):
    """Test case for the dashboard API endpoints"""
    
    def setUp(self):
        # Create test user with admin permissions
        self.admin_user = User.objects.create_user(
            email='admin@example.com',
            password='password123',
            first_name='Admin',
            last_name='User',
            role='ADMIN'
        )
        
        # Create test client
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin_user)
    
    def test_dashboard_summary_endpoint(self):
        """Test the dashboard summary endpoint"""
        url = reverse('dashboard-summary')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('events_overview', response.data)
        self.assertIn('revenue_overview', response.data)
        self.assertIn('clients_overview', response.data)
        self.assertIn('tasks_overview', response.data)
        self.assertIn('key_metrics', response.data)
        self.assertIn('recent_activity', response.data)
    
    def test_dashboard_summary_with_time_range(self):
        """Test dashboard summary with different time ranges"""
        url = reverse('dashboard-summary')
        
        # Test with day range
        response = self.client.get(url, {'time_range': 'day'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['time_range'], 'day')
        
        # Test with invalid range
        response = self.client.get(url, {'time_range': 'invalid'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_events_endpoint(self):
        """Test the events endpoint"""
        url = reverse('dashboard-events')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_events', response.data)
        self.assertIn('events_by_status', response.data)
        self.assertIn('upcoming_events', response.data)
    
    def test_revenue_endpoint(self):
        """Test the revenue endpoint"""
        url = reverse('dashboard-revenue')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_revenue', response.data)
        self.assertIn('revenue_by_status', response.data)
        self.assertIn('recent_payments', response.data)
    
    def test_clients_endpoint(self):
        """Test the clients endpoint"""
        url = reverse('dashboard-clients')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_clients', response.data)
        self.assertIn('active_clients', response.data)
        self.assertIn('new_clients', response.data)
    
    def test_tasks_endpoint(self):
        """Test the tasks endpoint"""
        url = reverse('dashboard-tasks')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_tasks', response.data)
        self.assertIn('completed_tasks', response.data)
        self.assertIn('overdue_tasks', response.data)
    
    def test_activity_endpoint(self):
        """Test the activity endpoint"""
        url = reverse('dashboard-activity')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(response.data, list))
    
    def test_metrics_endpoint(self):
        """Test the metrics endpoint"""
        url = reverse('dashboard-metrics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(isinstance(response.data, list))


class DashboardPreferenceAPITestCase(TestCase):
    """Test case for the dashboard preferences API endpoints"""
    
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123',
            first_name='Test',
            last_name='User',
            role='ADMIN'
        )
        
        # Create test client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def test_get_preferences(self):
        """Test getting user preferences"""
        # Create preference
        DashboardPreference.objects.create(
            user=self.user,
            layout=DashboardPreference.get_default_layout(),
            default_time_range='month'
        )
        
        url = reverse('dashboard-preferences-my-preferences')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['default_time_range'], 'month')
    
    def test_update_preferences(self):
        """Test updating user preferences"""
        # Create preference
        DashboardPreference.objects.create(
            user=self.user,
            layout=DashboardPreference.get_default_layout(),
            default_time_range='week'
        )
        
        url = reverse('dashboard-preferences-update-preferences')
        data = {
            'default_time_range': 'month',
            'layout': {
                'widgets': ['widget1', 'widget2'],
                'layout': {
                    'widget1': {'position': 1},
                    'widget2': {'position': 2}
                }
            }
        }
        
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['default_time_range'], 'month')
        
        # Check that layout was updated
        preference = DashboardPreference.objects.get(user=self.user)
        self.assertEqual(preference.default_time_range, 'month')
        self.assertEqual(preference.layout['widgets'], ['widget1', 'widget2'])
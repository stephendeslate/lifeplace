# backend/core/domains/notifications/tests.py
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from .models import (
    Notification,
    NotificationPreference,
    NotificationTemplate,
    NotificationType,
)
from .services import NotificationService

User = get_user_model()

class NotificationModelTests(TestCase):
    """Test the notification models"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            first_name='Test',
            last_name='User'
        )
        
        self.notification_type = NotificationType.objects.create(
            code='TEST_TYPE',
            name='Test Type',
            category='SYSTEM',
            icon='info',
            color='#000000'
        )
        
        self.template = NotificationTemplate.objects.create(
            notification_type=self.notification_type,
            title='Test Title',
            content='Test content with {{ variable }}',
            email_subject='Test Email Subject',
            email_body='Test email body with {{ variable }}',
            is_active=True
        )
        
        self.notification = Notification.objects.create(
            recipient=self.user,
            notification_type=self.notification_type,
            title='Test Notification',
            content='This is a test notification',
            action_url='/test'
        )
        
    def test_notification_creation(self):
        """Test that notifications can be created"""
        self.assertEqual(self.notification.recipient, self.user)
        self.assertEqual(self.notification.notification_type, self.notification_type)
        self.assertEqual(self.notification.title, 'Test Notification')
        self.assertEqual(self.notification.is_read, False)
        
    def test_notification_preference_creation(self):
        """Test notification preferences are created with users"""
        preference = NotificationPreference.objects.get(user=self.user)
        self.assertTrue(preference.email_enabled)
        self.assertTrue(preference.in_app_enabled)
        
    def test_notification_type_str_method(self):
        """Test the string representation of notification types"""
        self.assertEqual(str(self.notification_type), 'Test Type')
        
    def test_notification_template_str_method(self):
        """Test the string representation of notification templates"""
        self.assertEqual(str(self.template), 'Test Type - Test Title')
        
    def test_notification_str_method(self):
        """Test the string representation of notifications"""
        self.assertEqual(str(self.notification), f'Test Type for {self.user.email}')


class NotificationServiceTests(TestCase):
    """Test the notification service"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            first_name='Test',
            last_name='User'
        )
        
        self.notification_type = NotificationType.objects.create(
            code='TEST_TYPE',
            name='Test Type',
            category='SYSTEM',
            icon='info',
            color='#000000'
        )
        
        self.template = NotificationTemplate.objects.create(
            notification_type=self.notification_type,
            title='Test Title {{ name }}',
            content='Test content with {{ variable }}',
            email_subject='Test Email Subject',
            email_body='Test email body with {{ variable }}',
            is_active=True
        )
        
        self.notification = Notification.objects.create(
            recipient=self.user,
            notification_type=self.notification_type,
            title='Test Notification',
            content='This is a test notification',
            action_url='/test'
        )
        
    def test_get_notifications(self):
        """Test getting notifications for a user"""
        # Create an extra notification
        Notification.objects.create(
            recipient=self.user,
            notification_type=self.notification_type,
            title='Another Notification',
            content='This is another test notification',
            is_read=True
        )
        
        # Test getting all notifications
        notifications = NotificationService.get_notifications(self.user)
        self.assertEqual(notifications.count(), 2)
        
        # Test filtering by read status
        unread = NotificationService.get_notifications(self.user, is_read=False)
        self.assertEqual(unread.count(), 1)
        self.assertEqual(unread[0].title, 'Test Notification')
        
        read = NotificationService.get_notifications(self.user, is_read=True)
        self.assertEqual(read.count(), 1)
        self.assertEqual(read[0].title, 'Another Notification')
        
    def test_mark_as_read(self):
        """Test marking a notification as read"""
        # Ensure it starts unread
        self.assertFalse(self.notification.is_read)
        
        # Mark as read
        updated = NotificationService.mark_as_read(self.notification.id, self.user)
        
        # Check it was marked read
        self.assertTrue(updated.is_read)
        self.assertIsNotNone(updated.read_at)
        
        # Verify in database
        self.notification.refresh_from_db()
        self.assertTrue(self.notification.is_read)
        
    def test_mark_as_unread(self):
        """Test marking a notification as unread"""
        # First make it read
        self.notification.is_read = True
        self.notification.read_at = timezone.now()
        self.notification.save()
        
        # Mark as unread
        updated = NotificationService.mark_as_unread(self.notification.id, self.user)
        
        # Check it was marked unread
        self.assertFalse(updated.is_read)
        self.assertIsNone(updated.read_at)
        
        # Verify in database
        self.notification.refresh_from_db()
        self.assertFalse(self.notification.is_read)
        
    def test_mark_all_as_read(self):
        """Test marking all notifications as read"""
        # Create more unread notifications
        Notification.objects.create(
            recipient=self.user,
            notification_type=self.notification_type,
            title='Another Notification',
            content='This is another test notification'
        )
        
        Notification.objects.create(
            recipient=self.user,
            notification_type=self.notification_type,
            title='Third Notification',
            content='This is a third test notification'
        )
        
        # Mark all as read
        count = NotificationService.mark_all_as_read(self.user)
        
        # Should have updated 3 notifications
        self.assertEqual(count, 3)
        
        # Verify all are now read
        unread_count = Notification.objects.filter(recipient=self.user, is_read=False).count()
        self.assertEqual(unread_count, 0)
        
    def test_create_notification(self):
        """Test creating a notification with context variables"""
        context = {
            'name': 'User Name',
            'variable': 'Test Variable',
            'action_url': '/test/action',
            'content_type': 'test',
            'object_id': 123
        }
        
        # Create notification
        notification = NotificationService.create_notification(
            self.user,
            'TEST_TYPE',
            context,
            email=False
        )
        
        # Verify notification was created with interpolated templates
        self.assertEqual(notification.title, 'Test Title User Name')
        self.assertEqual(notification.content, 'Test content with Test Variable')
        self.assertEqual(notification.action_url, '/test/action')
        self.assertEqual(notification.content_type, 'test')
        self.assertEqual(notification.object_id, 123)
        
    def test_bulk_action_mark_read(self):
        """Test bulk marking notifications as read"""
        # Create additional notifications
        n2 = Notification.objects.create(
            recipient=self.user,
            notification_type=self.notification_type,
            title='Notification 2',
            content='Content 2'
        )
        
        n3 = Notification.objects.create(
            recipient=self.user,
            notification_type=self.notification_type,
            title='Notification 3',
            content='Content 3'
        )
        
        # Bulk mark as read
        count = NotificationService.bulk_action(
            self.user.id,
            [self.notification.id, n2.id],
            'mark_read'
        )
        
        # Should have marked 2 as read
        self.assertEqual(count, 2)
        
        # Check in database
        self.notification.refresh_from_db()
        n2.refresh_from_db()
        n3.refresh_from_db()
        
        self.assertTrue(self.notification.is_read)
        self.assertTrue(n2.is_read)
        self.assertFalse(n3.is_read)  # This one wasn't included
        
    def test_notification_counts(self):
        """Test getting notification counts"""
        # Create additional notifications with different read states
        Notification.objects.create(
            recipient=self.user,
            notification_type=self.notification_type,
            title='Read Notification',
            content='This is read',
            is_read=True
        )
        
        Notification.objects.create(
            recipient=self.user,
            notification_type=self.notification_type,
            title='Unread Notification',
            content='This is unread',
            is_read=False
        )
        
        # Get counts
        counts = NotificationService.get_notification_counts(self.user.id)
        
        # Should have 3 total (1 from setUp, 2 from this test)
        self.assertEqual(counts['total'], 3)
        
        # Should have 2 unread (1 from setUp, 1 from this test)
        self.assertEqual(counts['unread'], 2)


class NotificationAPITests(TestCase):
    """Test the notification API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        
        # Create a test user
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpassword',
            first_name='Test',
            last_name='User'
        )
        
        # Create an admin user
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='adminpassword',
            first_name='Admin',
            last_name='User',
            is_staff=True
        )
        
        # Create notification type and template
        self.notification_type = NotificationType.objects.create(
            code='TEST_TYPE',
            name='Test Type',
            category='SYSTEM',
            icon='info',
            color='#000000'
        )
        
        self.template = NotificationTemplate.objects.create(
            notification_type=self.notification_type,
            title='Test Title',
            content='Test content',
            is_active=True
        )
        
        # Create some notifications for the test user
        for i in range(3):
            Notification.objects.create(
                recipient=self.user,
                notification_type=self.notification_type,
                title=f'Test Notification {i+1}',
                content=f'This is test notification {i+1}',
                is_read=(i == 0)  # First one is read, others unread
            )
        
    def test_list_notifications_requires_auth(self):
        """Test that listing notifications requires authentication"""
        response = self.client.get('/api/notifications/notifications/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
    def test_list_notifications(self):
        """Test listing notifications"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/notifications/notifications/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 3)
        
    def test_list_unread_notifications(self):
        """Test listing only unread notifications"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/notifications/notifications/unread/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        
    def test_mark_notification_read(self):
        """Test marking a notification as read"""
        # Get the second notification (first unread one)
        notification = Notification.objects.filter(recipient=self.user, is_read=False).first()
        
        self.client.force_authenticate(user=self.user)
        response = self.client.post(f'/api/notifications/notifications/{notification.id}/mark_read/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['is_read'], True)
        
        # Verify in database
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)
        
    def test_mark_all_read(self):
        """Test marking all notifications as read"""
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/notifications/notifications/mark_all_read/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['marked_read'], 2)  # Two were unread
        
        # Verify in database
        unread_count = Notification.objects.filter(recipient=self.user, is_read=False).count()
        self.assertEqual(unread_count, 0)
        
    def test_notification_counts(self):
        """Test getting notification counts"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/notifications/notifications/counts/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total'], 3)
        self.assertEqual(response.data['unread'], 2)
        
    def test_bulk_action(self):
        """Test bulk actions on notifications"""
        # Get the notification IDs
        notifications = Notification.objects.filter(recipient=self.user, is_read=False)
        notification_ids = list(notifications.values_list('id', flat=True))
        
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/notifications/notifications/bulk_action/', {
            'notification_ids': notification_ids,
            'action': 'mark_read'
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        
        # Verify in database
        unread_count = Notification.objects.filter(recipient=self.user, is_read=False).count()
        self.assertEqual(unread_count, 0)
        
    def test_user_preferences(self):
        """Test getting and updating user preferences"""
        self.client.force_authenticate(user=self.user)
        
        # Get preferences
        response = self.client.get('/api/notifications/preferences/my_preferences/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Update preferences
        update_data = {
            'email_enabled': False,
            'system_notifications': False
        }
        
        response = self.client.put('/api/notifications/preferences/update_preferences/', update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email_enabled'], False)
        self.assertEqual(response.data['system_notifications'], False)
        
        # Verify in database
        prefs = NotificationPreference.objects.get(user=self.user)
        self.assertFalse(prefs.email_enabled)
        self.assertFalse(prefs.system_notifications)
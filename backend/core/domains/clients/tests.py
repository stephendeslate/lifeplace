# backend/core/domains/clients/tests.py
from core.domains.clients.services import ClientService
from core.domains.events.models import Event, EventType
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class ClientAPITests(APITestCase):
    """Test case for the client API endpoints"""
    
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
        
        # Update profile data
        if hasattr(self.client_user, 'profile'):
            self.client_user.profile.phone = "123-456-7890"
            self.client_user.profile.company = "Test Company"
            self.client_user.profile.save()
        
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
        
        # URLs
        self.clients_url = reverse('clients:client-list')
        self.client_detail_url = reverse('clients:client-detail', args=[self.client_user.id])
        self.client_events_url = reverse('clients:client-events', args=[self.client_user.id])
    
    def test_unauthorized_access(self):
        """Test unauthorized access to client API"""
        response = self.client.get(self.clients_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_admin_can_view_clients(self):
        """Test that admin can view clients"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.clients_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['email'], "client@example.com")
    
    def test_client_detail(self):
        """Test retrieving client detail"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.client_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], "client@example.com")
        self.assertEqual(response.data['profile']['phone'], "123-456-7890")
        self.assertEqual(response.data['profile']['company'], "Test Company")
    
    def test_create_client(self):
        """Test creating a new client"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "email": "newclient@example.com",
            "password": "newpassword",
            "first_name": "New",
            "last_name": "Client",
            "profile": {
                "phone": "555-555-5555",
                "company": "New Company"
            },
            "is_active": True
        }
        response = self.client.post(self.clients_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], "newclient@example.com")
        self.assertEqual(response.data['first_name'], "New")
        self.assertEqual(response.data['profile']['phone'], "555-555-5555")
        
        # Verify role was set to CLIENT
        new_user = User.objects.get(email="newclient@example.com")
        self.assertEqual(new_user.role, "CLIENT")
    
    def test_update_client(self):
        """Test updating a client"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            "first_name": "Updated",
            "last_name": "Client",
            "profile": {
                "phone": "999-999-9999",
                "company": "Updated Company"
            }
        }
        response = self.client.patch(self.client_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], "Updated")
        self.assertEqual(response.data['profile']['phone'], "999-999-9999")
        self.assertEqual(response.data['profile']['company'], "Updated Company")
    
    def test_client_events(self):
        """Test listing events for a client"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.client_events_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], "Smith Wedding")
    
    def test_deactivate_client(self):
        """Test deactivating a client"""
        self.client.force_authenticate(user=self.admin_user)
        
        # First complete the event to avoid deactivation error
        self.event.status = "COMPLETED"
        self.event.save()
        
        response = self.client.delete(self.client_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Check that client is now inactive
        updated_client = User.objects.get(id=self.client_user.id)
        self.assertFalse(updated_client.is_active)
    
    def test_cannot_deactivate_client_with_active_events(self):
        """Test cannot deactivate client with active events"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.client_detail_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_filter_clients_by_search(self):
        """Test filtering clients by search term"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Create another client
        User.objects.create_user(
            email="another@example.com",
            password="password",
            first_name="Another",
            last_name="Person",
            role="CLIENT"
        )
        
        # Search by name
        response = self.client.get(f"{self.clients_url}?search=Test")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['email'], "client@example.com")
        
        # Search by company
        response = self.client.get(f"{self.clients_url}?search=Company")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        
        # Search by email
        response = self.client.get(f"{self.clients_url}?search=client@example")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)


class ClientServiceTests(APITestCase):
    """Test case for the ClientService class"""
    
    def setUp(self):
        """Set up test data"""
        # Create client user
        self.client_user = User.objects.create_user(
            email="client@example.com",
            password="clientpassword",
            first_name="Test",
            last_name="Client",
            role="CLIENT"
        )
        
        # Update profile data
        if hasattr(self.client_user, 'profile'):
            self.client_user.profile.phone = "123-456-7890"
            self.client_user.profile.company = "Test Company"
            self.client_user.profile.save()
    
    def test_get_all_clients(self):
        """Test getting all clients"""
        # Create another non-client user
        User.objects.create_user(
            email="admin@example.com",
            password="adminpass",
            first_name="Admin",
            last_name="User",
            role="ADMIN"
        )
        
        clients = ClientService.get_all_clients()
        self.assertEqual(clients.count(), 1)
        self.assertEqual(clients.first().email, "client@example.com")
    
    def test_get_client_by_id(self):
        """Test getting a client by ID"""
        client = ClientService.get_client_by_id(self.client_user.id)
        self.assertEqual(client.email, "client@example.com")
    
    def test_create_client(self):
        """Test creating a client"""
        data = {
            "email": "newclient@example.com",
            "password": "newpassword",
            "first_name": "New",
            "last_name": "Client",
            "profile": {
                "phone": "555-555-5555",
                "company": "New Company"
            },
            "is_active": True
        }
        
        client = ClientService.create_client(data)
        self.assertEqual(client.email, "newclient@example.com")
        self.assertEqual(client.first_name, "New")
        self.assertEqual(client.role, "CLIENT")
        
        if hasattr(client, 'profile'):
            self.assertEqual(client.profile.phone, "555-555-5555")
            self.assertEqual(client.profile.company, "New Company")
    
    def test_update_client(self):
        """Test updating a client"""
        data = {
            "first_name": "Updated",
            "last_name": "Client",
            "profile": {
                "phone": "999-999-9999",
                "company": "Updated Company"
            }
        }
        
        updated_client = ClientService.update_client(self.client_user.id, data)
        self.assertEqual(updated_client.first_name, "Updated")
        
        if hasattr(updated_client, 'profile'):
            self.assertEqual(updated_client.profile.phone, "999-999-9999")
            self.assertEqual(updated_client.profile.company, "Updated Company")
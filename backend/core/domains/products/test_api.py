# backend/core/domains/products/test_api.py
from datetime import timedelta
from decimal import Decimal

from core.domains.users.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Discount, ProductOption


class ProductOptionAPITests(APITestCase):
    """Test case for the ProductOption API endpoints"""
    
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
        
        # Create product
        self.product = ProductOption.objects.create(
            name="Test Product",
            description="A test product",
            base_price=Decimal('100.00'),
            currency="PHP",
            tax_rate=Decimal('12.00'),
            type="PRODUCT",
            is_active=True
        )
        
        # Create package
        self.package = ProductOption.objects.create(
            name="Test Package",
            description="A test package",
            base_price=Decimal('500.00'),
            currency="PHP",
            tax_rate=Decimal('12.00'),
            type="PACKAGE",
            is_active=True,
            has_excess_hours=True,
            included_hours=10,
            excess_hour_price=Decimal('50.00')
        )
        
        # URL paths
        self.product_list_url = reverse('products:product-list')
        self.product_detail_url = reverse('products:product-detail', args=[self.product.id])
        self.package_detail_url = reverse('products:product-detail', args=[self.package.id])
        self.products_only_url = reverse('products:product-products')
        self.packages_only_url = reverse('products:product-packages')
    
    def test_unauthorized_access(self):
        """Test unauthorized access to products API"""
        response = self.client.get(self.product_list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_regular_user_access(self):
        """Test regular user cannot access products API"""
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.product_list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_view_products(self):
        """Test that admin can view products"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.product_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_filter_by_type(self):
        """Test filtering by product type"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Filter for products
        response = self.client.get(self.products_only_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['type'], 'PRODUCT')
        
        # Filter for packages
        response = self.client.get(self.packages_only_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['type'], 'PACKAGE')
    
    def test_create_product(self):
        """Test creating a new product"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': 'New Product',
            'description': 'A brand new product',
            'base_price': '150.00',
            'currency': 'PHP',
            'tax_rate': '12.00',
            'type': 'PRODUCT',
            'is_active': True,
            'allow_multiple': True,
            'has_excess_hours': False
        }
        response = self.client.post(self.product_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProductOption.objects.count(), 3)
        self.assertEqual(response.data['name'], 'New Product')
    
    def test_create_product_with_excess_hours(self):
        """Test creating a product with excess hours"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': 'New Product with Hours',
            'description': 'A brand new product with excess hours',
            'base_price': '200.00',
            'currency': 'PHP',
            'tax_rate': '12.00',
            'type': 'PRODUCT',
            'is_active': True,
            'allow_multiple': False,
            'has_excess_hours': True,
            'included_hours': 5,
            'excess_hour_price': '40.00'
        }
        response = self.client.post(self.product_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['has_excess_hours'], True)
        self.assertEqual(response.data['included_hours'], 5)
        self.assertEqual(Decimal(response.data['excess_hour_price']), Decimal('40.00'))
    
    def test_create_product_missing_hours(self):
        """Test validation for excess hours"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': 'New Product with Hours',
            'description': 'A brand new product with excess hours',
            'base_price': '200.00',
            'currency': 'PHP',
            'tax_rate': '12.00',
            'type': 'PRODUCT',
            'is_active': True,
            'allow_multiple': False,
            'has_excess_hours': True,
            # Missing included_hours and excess_hour_price
        }
        response = self.client.post(self.product_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('included_hours', response.data)
    
    def test_update_product(self):
        """Test updating a product"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'name': 'Updated Product',
            'description': 'Updated description',
            'base_price': '120.00'
        }
        response = self.client.patch(self.product_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Product')
        self.assertEqual(response.data['description'], 'Updated description')
        self.assertEqual(Decimal(response.data['base_price']), Decimal('120.00'))
    
    def test_delete_product(self):
        """Test deleting a product"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.product_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ProductOption.objects.count(), 1)  # Only package remains


class DiscountAPITests(APITestCase):
    """Test case for the Discount API endpoints"""
    
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
        
        # Create product
        self.product = ProductOption.objects.create(
            name="Test Product",
            description="A test product",
            base_price=Decimal('100.00'),
            currency="PHP",
            tax_rate=Decimal('12.00'),
            type="PRODUCT",
            is_active=True
        )
        
        # Create percentage discount
        today = timezone.now().date()
        self.percentage_discount = Discount.objects.create(
            code="PERCENT20",
            description="20% off",
            discount_type="PERCENTAGE",
            value=Decimal('20.00'),
            is_active=True,
            valid_from=today,
            valid_until=today + timedelta(days=30)
        )
        self.percentage_discount.applicable_products.add(self.product)
        
        # Create fixed amount discount
        self.fixed_discount = Discount.objects.create(
            code="FIXED50",
            description="PHP 50 off",
            discount_type="FIXED",
            value=Decimal('50.00'),
            is_active=True,
            valid_from=today,
            valid_until=today + timedelta(days=30),
            max_uses=100,
            current_uses=0
        )
        
        # URL paths
        self.discount_list_url = reverse('products:discount-list')
        self.percentage_detail_url = reverse('products:discount-detail', args=[self.percentage_discount.id])
        self.fixed_detail_url = reverse('products:discount-detail', args=[self.fixed_discount.id])
        self.valid_discounts_url = reverse('products:discount-valid')
    
    def test_admin_can_view_discounts(self):
        """Test that admin can view discounts"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.discount_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_filter_valid_discounts(self):
        """Test filtering for valid discounts"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.valid_discounts_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        
        # Make one discount inactive
        self.fixed_discount.is_active = False
        self.fixed_discount.save()
        
        response = self.client.get(self.valid_discounts_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_discount(self):
        """Test creating a new discount"""
        self.client.force_authenticate(user=self.admin_user)
        today = timezone.now().date().isoformat()
        next_month = (timezone.now().date() + timedelta(days=30)).isoformat()
        
        data = {
            'code': 'NEW25',
            'description': 'New 25% off discount',
            'discount_type': 'PERCENTAGE',
            'value': '25.00',
            'is_active': True,
            'valid_from': today,
            'valid_until': next_month,
            'applicable_products': [self.product.id]
        }
        response = self.client.post(self.discount_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Discount.objects.count(), 3)
        self.assertEqual(response.data['code'], 'NEW25')
        self.assertEqual(Decimal(response.data['value']), Decimal('25.00'))
    
    def test_create_discount_invalid_date_range(self):
        """Test validation for invalid date range"""
        self.client.force_authenticate(user=self.admin_user)
        today = timezone.now().date().isoformat()
        yesterday = (timezone.now().date() - timedelta(days=1)).isoformat()
        
        data = {
            'code': 'INVALID',
            'description': 'Invalid date range',
            'discount_type': 'PERCENTAGE',
            'value': '10.00',
            'is_active': True,
            'valid_from': today,
            'valid_until': yesterday,  # Before valid_from
        }
        response = self.client.post(self.discount_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_discount_invalid_value(self):
        """Test validation for invalid discount value"""
        self.client.force_authenticate(user=self.admin_user)
        today = timezone.now().date().isoformat()
        
        # Test percentage > 100
        data = {
            'code': 'INVALID',
            'description': 'Invalid percentage',
            'discount_type': 'PERCENTAGE',
            'value': '110.00',  # > 100%
            'is_active': True,
            'valid_from': today,
        }
        response = self.client.post(self.discount_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Test negative value
        data['value'] = '-10.00'
        response = self.client.post(self.discount_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_discount(self):
        """Test updating a discount"""
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'description': 'Updated description',
            'value': '25.00'
        }
        response = self.client.patch(self.percentage_detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['description'], 'Updated description')
        self.assertEqual(Decimal(response.data['value']), Decimal('25.00'))
    
    def test_delete_discount(self):
        """Test deleting a discount"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.percentage_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Discount.objects.count(), 1)  # Only fixed discount remains
    
    def test_increment_usage(self):
        """Test incrementing discount usage"""
        self.client.force_authenticate(user=self.admin_user)
        increment_url = reverse('products:discount-increment-usage', args=[self.fixed_discount.id])
        
        # Initial usage is 0
        self.assertEqual(self.fixed_discount.current_uses, 0)
        
        # Increment usage
        response = self.client.post(increment_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Refresh from database
        self.fixed_discount.refresh_from_db()
        self.assertEqual(self.fixed_discount.current_uses, 1)
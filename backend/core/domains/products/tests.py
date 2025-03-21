# backend/core/domains/products/tests.py
from datetime import timedelta
from decimal import Decimal

from django.test import TestCase
from django.utils import timezone

from .models import Discount, ProductOption


class ProductOptionModelTests(TestCase):
    """Test case for the ProductOption model"""
    
    def setUp(self):
        """Set up test data"""
        # Create a product
        self.product = ProductOption.objects.create(
            name="Test Product",
            description="A test product",
            base_price=Decimal('100.00'),
            currency="PHP",
            tax_rate=Decimal('12.00'),
            type="PRODUCT",
            is_active=True
        )
        
        # Create a package with excess hours
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
    
    def test_product_creation(self):
        """Test that products can be created correctly"""
        self.assertEqual(self.product.name, "Test Product")
        self.assertEqual(self.product.type, "PRODUCT")
        self.assertEqual(self.product.base_price, Decimal('100.00'))
        self.assertTrue(self.product.is_active)
        self.assertFalse(self.product.has_excess_hours)
    
    def test_package_creation(self):
        """Test that packages can be created correctly"""
        self.assertEqual(self.package.name, "Test Package")
        self.assertEqual(self.package.type, "PACKAGE")
        self.assertEqual(self.package.base_price, Decimal('500.00'))
        self.assertTrue(self.package.has_excess_hours)
        self.assertEqual(self.package.included_hours, 10)
        self.assertEqual(self.package.excess_hour_price, Decimal('50.00'))
    
    def test_string_representation(self):
        """Test string representation of products"""
        self.assertEqual(str(self.product), "Test Product")
        self.assertEqual(str(self.package), "Test Package")


class DiscountModelTests(TestCase):
    """Test case for the Discount model"""
    
    def setUp(self):
        """Set up test data"""
        # Create products
        self.product = ProductOption.objects.create(
            name="Test Product",
            description="A test product",
            base_price=Decimal('100.00'),
            currency="PHP",
            tax_rate=Decimal('12.00'),
            type="PRODUCT",
            is_active=True
        )
        
        # Create a percentage discount
        self.percentage_discount = Discount.objects.create(
            code="PERCENT20",
            description="20% off",
            discount_type="PERCENTAGE",
            value=Decimal('20.00'),
            is_active=True,
            valid_from=timezone.now().date(),
            valid_until=timezone.now().date() + timedelta(days=30)
        )
        self.percentage_discount.applicable_products.add(self.product)
        
        # Create a fixed amount discount
        self.fixed_discount = Discount.objects.create(
            code="FIXED50",
            description="PHP 50 off",
            discount_type="FIXED",
            value=Decimal('50.00'),
            is_active=True,
            valid_from=timezone.now().date(),
            valid_until=timezone.now().date() + timedelta(days=30),
            max_uses=100,
            current_uses=0
        )
        
        # Create an expired discount
        yesterday = timezone.now().date() - timedelta(days=1)
        self.expired_discount = Discount.objects.create(
            code="EXPIRED",
            description="Expired discount",
            discount_type="PERCENTAGE",
            value=Decimal('10.00'),
            is_active=True,
            valid_from=yesterday - timedelta(days=30),
            valid_until=yesterday
        )
        
        # Create an inactive discount
        self.inactive_discount = Discount.objects.create(
            code="INACTIVE",
            description="Inactive discount",
            discount_type="PERCENTAGE",
            value=Decimal('10.00'),
            is_active=False,
            valid_from=timezone.now().date(),
            valid_until=timezone.now().date() + timedelta(days=30)
        )
    
    def test_discount_creation(self):
        """Test that discounts can be created correctly"""
        self.assertEqual(self.percentage_discount.code, "PERCENT20")
        self.assertEqual(self.percentage_discount.discount_type, "PERCENTAGE")
        self.assertEqual(self.percentage_discount.value, Decimal('20.00'))
        self.assertEqual(self.fixed_discount.code, "FIXED50")
        self.assertEqual(self.fixed_discount.discount_type, "FIXED")
        self.assertEqual(self.fixed_discount.value, Decimal('50.00'))
    
    def test_discount_validity(self):
        """Test the is_valid method"""
        self.assertTrue(self.percentage_discount.is_valid())
        self.assertTrue(self.fixed_discount.is_valid())
        self.assertFalse(self.expired_discount.is_valid())
        self.assertFalse(self.inactive_discount.is_valid())
    
    def test_max_uses(self):
        """Test max uses functionality"""
        self.assertTrue(self.fixed_discount.is_valid())
        
        # Update current uses to max
        self.fixed_discount.current_uses = 100
        self.fixed_discount.save()
        self.assertFalse(self.fixed_discount.is_valid())
    
    def test_applicable_products(self):
        """Test applicable products relationship"""
        self.assertEqual(self.percentage_discount.applicable_products.count(), 1)
        self.assertEqual(self.percentage_discount.applicable_products.first(), self.product)
    
    def test_string_representation(self):
        """Test string representation of discounts"""
        self.assertEqual(str(self.percentage_discount), "PERCENT20 - Percentage: 20.00")
        self.assertEqual(str(self.fixed_discount), "FIXED50 - Fixed Amount: 50.00")
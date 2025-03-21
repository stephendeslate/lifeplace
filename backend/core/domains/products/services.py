# backend/core/domains/products/services.py
import logging

from django.db import models, transaction
from django.db.models import Q
from django.utils import timezone

from .exceptions import DiscountCodeExists, DiscountNotFound, ProductNotFound
from .models import Discount, ProductOption

logger = logging.getLogger(__name__)


class ProductService:
    """Service for managing products"""
    
    @staticmethod
    def get_all_products(search_query=None, product_type=None, is_active=None):
        """Get all products with filtering options"""
        queryset = ProductOption.objects.all()
        
        # Apply filters if provided
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query)
            )
        
        if product_type:
            queryset = queryset.filter(type=product_type)
            
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)
            
        # Order by type (packages first, then products) and then by name
        return queryset.order_by('-type', 'name')
    
    @staticmethod
    def get_product_by_id(product_id):
        """Get a product by ID"""
        try:
            return ProductOption.objects.get(id=product_id)
        except ProductOption.DoesNotExist:
            raise ProductNotFound()
    
    @staticmethod
    def create_product(product_data):
        """Create a new product"""
        with transaction.atomic():
            product = ProductOption.objects.create(**product_data)
            logger.info(f"Created new {product.get_type_display()}: {product.name}")
            return product
    
    @staticmethod
    def update_product(product_id, product_data):
        """Update an existing product"""
        product = ProductService.get_product_by_id(product_id)
        
        with transaction.atomic():
            for key, value in product_data.items():
                setattr(product, key, value)
            
            product.save()
            logger.info(f"Updated {product.get_type_display()}: {product.name}")
            return product
    
    @staticmethod
    def delete_product(product_id):
        """Delete a product"""
        product = ProductService.get_product_by_id(product_id)
        product_name = product.name
        product_type = product.get_type_display()
        
        with transaction.atomic():
            product.delete()
            logger.info(f"Deleted {product_type}: {product_name}")
            return True


class DiscountService:
    """Service for managing discounts"""
    
    @staticmethod
    def get_all_discounts(search_query=None, is_active=None, is_valid=None):
        """Get all discounts with filtering options"""
        queryset = Discount.objects.all()
        
        # Apply filters if provided
        if search_query:
            queryset = queryset.filter(
                Q(code__icontains=search_query) |
                Q(description__icontains=search_query)
            )
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)
            
        # Filter by current validity
        today = timezone.now().date()
        if is_valid is not None:
            if is_valid:
                # Valid discounts: active, not expired, not reached max uses
                queryset = queryset.filter(
                    is_active=True,
                    valid_from__lte=today
                ).filter(
                    Q(valid_until__isnull=True) | Q(valid_until__gte=today)
                ).filter(
                    Q(max_uses__isnull=True) | Q(current_uses__lt=models.F('max_uses'))
                )
            else:
                # Invalid discounts: either inactive, expired, or reached max uses
                queryset = queryset.filter(
                    Q(is_active=False) |
                    Q(valid_from__gt=today) |
                    Q(valid_until__lt=today) |
                    Q(max_uses__isnull=False, current_uses__gte=models.F('max_uses'))
                )
            
        return queryset
    
    @staticmethod
    def get_discount_by_id(discount_id):
        """Get a discount by ID"""
        try:
            return Discount.objects.get(id=discount_id)
        except Discount.DoesNotExist:
            raise DiscountNotFound()
    
    @staticmethod
    def get_discount_by_code(code):
        """Get a discount by code"""
        try:
            return Discount.objects.get(code=code)
        except Discount.DoesNotExist:
            raise DiscountNotFound()
    
    @staticmethod
    def create_discount(discount_data):
        """Create a new discount"""
        # Check if discount code already exists
        code = discount_data.get('code')
        if Discount.objects.filter(code__iexact=code).exists():
            raise DiscountCodeExists()
        
        with transaction.atomic():
            # Extract applicable_products if included
            applicable_products = discount_data.pop('applicable_products', [])
            
            # Create discount
            discount = Discount.objects.create(**discount_data)
            
            # Add applicable products
            if applicable_products:
                discount.applicable_products.set(applicable_products)
            
            logger.info(f"Created new discount: {discount.code}")
            return discount
    
    @staticmethod
    def update_discount(discount_id, discount_data):
        """Update an existing discount"""
        discount = DiscountService.get_discount_by_id(discount_id)
        
        # Check if code is being changed and would conflict
        if 'code' in discount_data and discount_data['code'] != discount.code:
            if Discount.objects.filter(code__iexact=discount_data['code']).exists():
                raise DiscountCodeExists()
        
        with transaction.atomic():
            # Handle applicable_products separately if included
            applicable_products = None
            if 'applicable_products' in discount_data:
                applicable_products = discount_data.pop('applicable_products')
            
            # Update discount fields
            for key, value in discount_data.items():
                setattr(discount, key, value)
            
            discount.save()
            
            # Update applicable products if provided
            if applicable_products is not None:
                discount.applicable_products.set(applicable_products)
            
            logger.info(f"Updated discount: {discount.code}")
            return discount
    
    @staticmethod
    def delete_discount(discount_id):
        """Delete a discount"""
        discount = DiscountService.get_discount_by_id(discount_id)
        discount_code = discount.code
        
        with transaction.atomic():
            discount.delete()
            logger.info(f"Deleted discount: {discount_code}")
            return True
    
    @staticmethod
    def increment_discount_usage(discount_id):
        """Increment the usage count of a discount"""
        discount = DiscountService.get_discount_by_id(discount_id)
        
        discount.current_uses += 1
        discount.save(update_fields=['current_uses', 'updated_at'])
        
        return discount
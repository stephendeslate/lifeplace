# backend/core/domains/products/serializers.py
from django.utils import timezone
from rest_framework import serializers

from .exceptions import InvalidDateRange, InvalidDiscountValue
from .models import Discount, ProductOption


class ProductOptionSerializer(serializers.ModelSerializer):
    """Serializer for products and packages"""
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = ProductOption
        fields = [
            'id', 'name', 'description', 'base_price', 'currency', 'tax_rate',
            'event_type', 'type', 'type_display', 'is_active', 'allow_multiple',
            'has_excess_hours', 'included_hours', 'excess_hour_price',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate product data"""
        # If product has excess hours, ensure included_hours and excess_hour_price are provided
        if data.get('has_excess_hours', False):
            if not data.get('included_hours'):
                raise serializers.ValidationError({'included_hours': 'Required when has_excess_hours is True'})
            if not data.get('excess_hour_price'):
                raise serializers.ValidationError({'excess_hour_price': 'Required when has_excess_hours is True'})
        
        return data


class DiscountSerializer(serializers.ModelSerializer):
    """Serializer for discounts"""
    discount_type_display = serializers.CharField(source='get_discount_type_display', read_only=True)
    is_valid_now = serializers.SerializerMethodField()
    applicable_products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Discount
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_type_display',
            'value', 'is_active', 'valid_from', 'valid_until', 'max_uses',
            'current_uses', 'is_valid_now', 'applicable_products', 
            'applicable_products_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_uses', 'created_at', 'updated_at']
    
    def get_is_valid_now(self, obj):
        """Return whether the discount is currently valid"""
        return obj.is_valid()
    
    def get_applicable_products_count(self, obj):
        """Return count of applicable products"""
        return obj.applicable_products.count()
    
    def validate(self, data):
        """Validate discount data"""
        # Check if value is valid based on discount type
        discount_type = data.get('discount_type', self.instance.discount_type if self.instance else None)
        value = data.get('value', self.instance.value if self.instance else None)
        
        if discount_type == 'PERCENTAGE' and (value <= 0 or value > 100):
            raise InvalidDiscountValue("Percentage discount must be between 0 and 100")
        
        if discount_type == 'FIXED' and value <= 0:
            raise InvalidDiscountValue("Fixed amount discount must be greater than 0")
        
        # Check if valid_until is after valid_from
        valid_from = data.get('valid_from', self.instance.valid_from if self.instance else None)
        valid_until = data.get('valid_until', self.instance.valid_until if self.instance else None)
        
        if valid_from and valid_until and valid_until < valid_from:
            raise InvalidDateRange()
            
        return data


class DiscountDetailSerializer(DiscountSerializer):
    """Detailed discount serializer with full applicable products information"""
    applicable_products = ProductOptionSerializer(many=True, read_only=True)
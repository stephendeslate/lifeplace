# backend/core/domains/products/views.py
from core.utils.permissions import IsAdmin
from django.db import transaction
from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Discount, ProductOption
from .serializers import (
    DiscountDetailSerializer,
    DiscountSerializer,
    ProductOptionSerializer,
)
from .services import DiscountService, ProductService


class ProductOptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product options (products and packages)
    """
    serializer_class = ProductOptionSerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        product_type = self.request.query_params.get('type', None)
        is_active = self.request.query_params.get('is_active', None)
        
        # Convert string to boolean if provided
        if is_active is not None:
            is_active = is_active.lower() == 'true'
        
        return ProductService.get_all_products(
            product_type=product_type,
            is_active=is_active
        )
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            product = ProductService.create_product(serializer.validated_data)
        
        return Response(
            self.get_serializer(product).data, 
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            product = ProductService.update_product(
                instance.id, 
                serializer.validated_data
            )
        
        return Response(self.get_serializer(product).data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        with transaction.atomic():
            ProductService.delete_product(instance.id)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def packages(self, request):
        """Get only packages"""
        packages = ProductService.get_all_products(product_type='PACKAGE')
        page = self.paginate_queryset(packages)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(packages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def products(self, request):
        """Get only products"""
        products = ProductService.get_all_products(product_type='PRODUCT')
        page = self.paginate_queryset(products)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active products/packages"""
        active = ProductService.get_all_products(is_active=True)
        page = self.paginate_queryset(active)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(active, many=True)
        return Response(serializer.data)


class DiscountViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Discounts
    """
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['code', 'description']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DiscountDetailSerializer
        return DiscountSerializer
    
    def get_queryset(self):
        is_active = self.request.query_params.get('is_active', None)
        is_valid = self.request.query_params.get('is_valid', None)
        
        # Convert string to boolean if provided
        if is_active is not None:
            is_active = is_active.lower() == 'true'
        
        if is_valid is not None:
            is_valid = is_valid.lower() == 'true'
        
        return DiscountService.get_all_discounts(
            is_active=is_active,
            is_valid=is_valid
        )
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            discount = DiscountService.create_discount(serializer.validated_data)
        
        return Response(
            self.get_serializer(discount).data, 
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            discount = DiscountService.update_discount(
                instance.id, 
                serializer.validated_data
            )
        
        return Response(self.get_serializer(discount).data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        with transaction.atomic():
            DiscountService.delete_discount(instance.id)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def valid(self, request):
        """Get currently valid discounts"""
        valid = DiscountService.get_all_discounts(is_valid=True)
        page = self.paginate_queryset(valid)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(valid, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def increment_usage(self, request, pk=None):
        """Increment the usage count of a discount"""
        discount = self.get_object()
        discount = DiscountService.increment_discount_usage(discount.id)
        return Response(self.get_serializer(discount).data)
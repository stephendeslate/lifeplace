# backend/core/domains/bookingflow/views.py
from core.domains.events.models import EventType
from core.domains.events.serializers import EventTypeSerializer
from core.utils.permissions import IsAdmin
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import BookingFlow, BookingStep, ProductStepConfiguration, ProductStepItem
from .serializers import (
    BookingFlowDetailSerializer,
    BookingFlowSerializer,
    BookingFlowWithStepsSerializer,
    BookingStepDetailSerializer,
    BookingStepSerializer,
    ProductStepItemSerializer,
)
from .services import BookingFlowService, BookingStepService, ProductStepItemService


class BookingFlowViewSet(viewsets.ModelViewSet):
    """
    ViewSet for booking flows
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        event_type_id = self.request.query_params.get('event_type', None)
        is_active = self.request.query_params.get('is_active', None)
        
        # Convert string to boolean if provided
        if is_active is not None:
            is_active = is_active.lower() == 'true'
        
        return BookingFlowService.get_all_flows(
            event_type_id=event_type_id,
            is_active=is_active
        )
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BookingFlowDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return BookingFlowWithStepsSerializer
        return BookingFlowSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        flow = BookingFlowService.create_flow(serializer.validated_data)
        
        return Response(
            BookingFlowDetailSerializer(flow).data, 
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        flow = BookingFlowService.update_flow(
            instance.id, 
            serializer.validated_data
        )
        
        return Response(BookingFlowDetailSerializer(flow).data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        BookingFlowService.delete_flow(instance.id)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get'])
    def steps(self, request, pk=None):
        """Get all steps for a flow"""
        steps = BookingStepService.get_steps_for_flow(pk)
        serializer = BookingStepSerializer(steps, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active flows"""
        active_flows = BookingFlowService.get_all_flows(is_active=True)
        page = self.paginate_queryset(active_flows)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(active_flows, many=True)
        return Response(serializer.data)


class BookingStepViewSet(viewsets.ModelViewSet):
    """
    ViewSet for booking steps
    """
    serializer_class = BookingStepSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return BookingStep.objects.all().order_by('booking_flow', 'order')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BookingStepDetailSerializer
        return BookingStepSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Extract booking_flow instance and get its ID
        data = serializer.validated_data.copy()
        flow = data.get('booking_flow')
        flow_id = flow.id if hasattr(flow, 'id') else flow
        
        step = BookingStepService.create_step(flow_id, data)
        
        return Response(
            self.get_serializer(step).data, 
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        step = BookingStepService.update_step(
            instance.id, 
            serializer.validated_data
        )
        
        return Response(self.get_serializer(step).data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        BookingStepService.delete_step(instance.id)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder steps within a flow"""
        flow_id = request.data.get('flow_id')
        order_mapping = request.data.get('order_mapping', {})
        
        if not flow_id or not order_mapping:
            return Response(
                {"detail": "Missing required fields: flow_id or order_mapping"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        steps = BookingStepService.reorder_steps(flow_id, order_mapping)
        
        serializer = self.get_serializer(steps, many=True)
        return Response(serializer.data)


class ProductStepItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for product step items
    """
    serializer_class = ProductStepItemSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return ProductStepItem.objects.all().order_by('config', 'order')
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Extract config instance and get its ID
        data = serializer.validated_data.copy()
        config = data.pop('config')
        config_id = config.id if hasattr(config, 'id') else config
        
        item = ProductStepItemService.create_item(config_id, data)
        
        return Response(
            self.get_serializer(item).data, 
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        item = ProductStepItemService.update_item(
            instance.id, 
            serializer.validated_data
        )
        
        return Response(self.get_serializer(item).data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        ProductStepItemService.delete_item(instance.id)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder product items within a configuration"""
        config_id = request.data.get('config_id')
        order_mapping = request.data.get('order_mapping', {})
        
        if not config_id or not order_mapping:
            return Response(
                {"detail": "Missing required fields: config_id or order_mapping"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        items = ProductStepItemService.reorder_items(config_id, order_mapping)
        
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_config(self, request):
        """Get items for a specific config"""
        config_id = request.query_params.get('config_id')
        
        if not config_id:
            return Response(
                {"detail": "Missing required parameter: config_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        items = ProductStepItemService.get_items_for_config(config_id)
        
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)


class EventTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for event types
    """
    queryset = EventType.objects.all().order_by('name')
    serializer_class = EventTypeSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        is_active = self.request.query_params.get('is_active', None)
        
        queryset = EventType.objects.all().order_by('name')
        
        # Filter by active status if provided
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active event types"""
        active_types = EventType.objects.filter(is_active=True).order_by('name')
        serializer = self.get_serializer(active_types, many=True)
        return Response(serializer.data)
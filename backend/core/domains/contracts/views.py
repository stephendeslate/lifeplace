# backend/core/domains/contracts/views.py
from core.utils.permissions import IsAdmin, IsOwnerOrAdmin
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import ContractTemplate, EventContract
from .serializers import (
    ContractSignatureSerializer,
    ContractTemplateCreateUpdateSerializer,
    ContractTemplateDetailSerializer,
    ContractTemplateSerializer,
    EventContractCreateSerializer,
    EventContractDetailSerializer,
    EventContractSerializer,
    EventContractUpdateSerializer,
)
from .services import ContractTemplateService, EventContractService


class ContractTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for contract templates
    """
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        event_type_id = self.request.query_params.get('event_type', None)
        search = self.request.query_params.get('search', None)
        
        return ContractTemplateService.get_all_templates(
            search_query=search, 
            event_type_id=event_type_id
        )
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ContractTemplateDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ContractTemplateCreateUpdateSerializer
        return ContractTemplateSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        template = ContractTemplateService.create_template(serializer.validated_data)
        
        return Response(
            ContractTemplateDetailSerializer(template).data, 
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        template = ContractTemplateService.update_template(
            instance.id, 
            serializer.validated_data
        )
        
        return Response(ContractTemplateDetailSerializer(template).data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        ContractTemplateService.delete_template(instance.id)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def for_event_type(self, request):
        """Get templates for a specific event type"""
        event_type_id = request.query_params.get('event_type', None)
        
        if not event_type_id:
            return Response(
                {"detail": "Event type ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        templates = ContractTemplateService.get_all_templates(event_type_id=event_type_id)
        page = self.paginate_queryset(templates)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(templates, many=True)
        return Response(serializer.data)


class EventContractViewSet(viewsets.ModelViewSet):
    """
    ViewSet for event contracts
    """
    permission_classes = [IsOwnerOrAdmin]
    
    def get_queryset(self):
        # Admin gets all contracts, clients get only their own
        if self.request.user.role == 'ADMIN':
            return EventContract.objects.all().order_by('-created_at')
        else:
            # Client users only see contracts from their events
            return EventContract.objects.filter(
                event__client=self.request.user
            ).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EventContractDetailSerializer
        if self.action == 'create':
            return EventContractCreateSerializer
        if self.action in ['update', 'partial_update']:
            return EventContractUpdateSerializer
        if self.action == 'sign':
            return ContractSignatureSerializer
        return EventContractSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Extract context data if provided
        context_data = request.data.get('context_data', {})
        
        # Create contract from template
        contract = EventContractService.create_contract_from_template(
            event_id=serializer.validated_data['event'].id,
            template_id=serializer.validated_data['template'].id,
            valid_until=serializer.validated_data.get('valid_until'),
            context_data=context_data
        )
        
        return Response(
            EventContractDetailSerializer(contract).data, 
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        contract = EventContractService.update_contract(
            instance.id, 
            serializer.validated_data
        )
        
        return Response(EventContractDetailSerializer(contract).data)
    
    @action(detail=True, methods=['post'])
    def sign(self, request, pk=None):
        """Sign a contract"""
        contract = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        signed_contract = EventContractService.sign_contract(
            contract_id=contract.id,
            user_id=request.user.id,
            signature_data=serializer.validated_data['signature_data'],
            witness_name=serializer.validated_data.get('witness_name'),
            witness_signature=serializer.validated_data.get('witness_signature')
        )
        
        return Response(
            EventContractDetailSerializer(signed_contract).data, 
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def void(self, request, pk=None):
        """Void a contract"""
        contract = self.get_object()
        reason = request.data.get('reason')
        
        voided_contract = EventContractService.void_contract(
            contract_id=contract.id,
            reason=reason
        )
        
        return Response(
            EventContractDetailSerializer(voided_contract).data, 
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def for_event(self, request):
        """Get contracts for a specific event"""
        event_id = request.query_params.get('event_id', None)
        
        if not event_id:
            return Response(
                {"detail": "Event ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Apply permissions - check if user has access to this event
        if request.user.role != 'ADMIN':
            # For client users, check if the event belongs to them
            if not request.user.events.filter(id=event_id).exists():
                return Response(
                    {"detail": "You do not have permission to view contracts for this event"},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        contracts = EventContractService.get_contracts_for_event(event_id)
        serializer = EventContractSerializer(contracts, many=True)
        return Response(serializer.data)
# backend/core/domains/contracts/services.py
import datetime
import logging
import re

from django.db import models, transaction
from django.db.models import Q
from django.utils import timezone

from .exceptions import (
    ContractAlreadySigned,
    ContractExpired,
    ContractTemplateNotFound,
    EventContractNotFound,
    EventNotFound,
    InvalidContractStatus,
    InvalidContractTemplate,
    SignatureRequired,
)
from .models import ContractTemplate, EventContract

# Get logger
logger = logging.getLogger(__name__)


class ContractTemplateService:
    """Service for managing contract templates"""
    
    @staticmethod
    def get_all_templates(search_query=None, event_type_id=None, is_active=None):
        """Get all contract templates with optional filtering"""
        queryset = ContractTemplate.objects.all()
        
        # Apply filters if provided
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query)
            )
        
        if event_type_id:
            queryset = queryset.filter(event_type_id=event_type_id)
            
        return queryset.order_by('name')
    
    @staticmethod
    def get_template_by_id(template_id):
        """Get a contract template by ID"""
        try:
            return ContractTemplate.objects.get(id=template_id)
        except ContractTemplate.DoesNotExist:
            raise ContractTemplateNotFound()
    
    @staticmethod
    def create_template(template_data):
        """Create a new contract template"""
        with transaction.atomic():
            template = ContractTemplate.objects.create(**template_data)
            logger.info(f"Created new contract template: {template.name}")
            return template
    
    @staticmethod
    def update_template(template_id, template_data):
        """Update an existing contract template"""
        template = ContractTemplateService.get_template_by_id(template_id)
        
        with transaction.atomic():
            # Update template fields
            for key, value in template_data.items():
                setattr(template, key, value)
            
            template.save()
            logger.info(f"Updated contract template: {template.name}")
            return template
    
    @staticmethod
    def delete_template(template_id):
        """Delete a contract template"""
        template = ContractTemplateService.get_template_by_id(template_id)
        
        # Check if template is used by any contracts
        contract_count = EventContract.objects.filter(template=template).count()
        if contract_count > 0:
            raise InvalidContractTemplate(
                detail=f"Cannot delete template as it is used by {contract_count} contracts"
            )
        
        with transaction.atomic():
            template_name = template.name
            template.delete()
            logger.info(f"Deleted contract template: {template_name}")
            return True
            
    @staticmethod
    def render_contract(template_id, context_data):
        """
        Render a contract template with context data
        
        Args:
            template_id: ID of the contract template
            context_data: Dictionary of variable values to insert into the template
            
        Returns:
            Rendered contract content
        """
        template = ContractTemplateService.get_template_by_id(template_id)
        content = template.content
        
        # Simple variable substitution
        for var_name, var_value in context_data.items():
            placeholder = f"{{{{{var_name}}}}}"
            content = content.replace(placeholder, str(var_value))
        
        return content


class EventContractService:
    """Service for managing event contracts"""
    
    @staticmethod
    def get_contracts_for_event(event_id):
        """Get all contracts for a specific event"""
        return EventContract.objects.filter(event_id=event_id).order_by('-created_at')
    
    @staticmethod
    def get_contract_by_id(contract_id):
        """Get an event contract by ID"""
        try:
            return EventContract.objects.get(id=contract_id)
        except EventContract.DoesNotExist:
            raise EventContractNotFound()
    
    @staticmethod
    def create_contract_from_template(event_id, template_id, valid_until=None, context_data=None):
        """
        Create a new event contract from a template
        
        Args:
            event_id: ID of the event to create contract for
            template_id: ID of the contract template to use
            valid_until: Optional expiry date for the contract
            context_data: Dictionary of variable values to insert into the template
            
        Returns:
            The created EventContract instance
        """
        try:
            template = ContractTemplate.objects.get(id=template_id)
        except ContractTemplate.DoesNotExist:
            raise ContractTemplateNotFound()
        
        # Get rendered content
        context_data = context_data or {}
        rendered_content = ContractTemplateService.render_contract(template_id, context_data)
        
        with transaction.atomic():
            contract = EventContract.objects.create(
                event_id=event_id,
                template=template,
                status='DRAFT',
                content=rendered_content,
                valid_until=valid_until
            )
            
            logger.info(f"Created new contract for event {event_id} using template {template.name}")
            return contract
    
    @staticmethod
    def update_contract(contract_id, contract_data):
        """Update an existing event contract"""
        contract = EventContractService.get_contract_by_id(contract_id)
        
        # Check if contract is already signed
        if contract.status == 'SIGNED' and 'content' in contract_data:
            raise ContractAlreadySigned(
                detail="Cannot update content of a signed contract"
            )
        
        with transaction.atomic():
            # Update contract fields
            for key, value in contract_data.items():
                setattr(contract, key, value)
            
            # Update timestamps based on status transitions
            if 'status' in contract_data:
                if contract_data['status'] == 'SENT' and not contract.sent_at:
                    contract.sent_at = timezone.now()
            
            contract.save()
            logger.info(f"Updated contract {contract_id} for event {contract.event.id}")
            return contract
    
    @staticmethod
    def sign_contract(contract_id, user_id, signature_data, witness_name=None, witness_signature=None):
        """
        Sign a contract
        
        Args:
            contract_id: ID of the contract to sign
            user_id: ID of the user signing the contract
            signature_data: Signature data (e.g., image data)
            witness_name: Optional witness name
            witness_signature: Optional witness signature data
            
        Returns:
            The updated EventContract instance
        """
        contract = EventContractService.get_contract_by_id(contract_id)
        
        # Validate contract can be signed
        if contract.status != 'SENT':
            raise InvalidContractStatus(
                detail=f"Contract is in {contract.status} status and cannot be signed"
            )
        
        if contract.valid_until and contract.valid_until < datetime.date.today():
            raise ContractExpired()
        
        if not signature_data:
            raise SignatureRequired()
        
        with transaction.atomic():
            contract.status = 'SIGNED'
            contract.signed_at = timezone.now()
            contract.signed_by_id = user_id
            contract.signature_data = signature_data
            
            if witness_name:
                contract.witness_name = witness_name
            
            if witness_signature:
                contract.witness_signature = witness_signature
            
            contract.save()
            logger.info(f"Contract {contract_id} signed by user {user_id}")
            return contract
    
    @staticmethod
    def void_contract(contract_id, reason=None):
        """
        Void a contract
        
        Args:
            contract_id: ID of the contract to void
            reason: Optional reason for voiding the contract
            
        Returns:
            The updated EventContract instance
        """
        contract = EventContractService.get_contract_by_id(contract_id)
        
        # Check if contract can be voided
        if contract.status == 'SIGNED':
            raise InvalidContractStatus(
                detail="Cannot void a signed contract"
            )
        
        with transaction.atomic():
            contract.status = 'VOID'
            contract.save()
            
            # Log the reason if provided
            if reason:
                logger.info(f"Contract {contract_id} voided. Reason: {reason}")
            else:
                logger.info(f"Contract {contract_id} voided")
                
            return contract
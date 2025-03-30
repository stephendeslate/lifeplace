# backend/core/domains/bookingflow/services.py
import logging

from django.db import models, transaction
from django.db.models import Max, Q

from .exceptions import (
    BookingFlowNotFound,
    BookingStepNotFound,
    DuplicateStepOrder,
    InvalidStepTypeForConfiguration,
    ProductItemNotFound,
)
from .models import (
    BookingFlow,
    BookingStep,
    CustomStepConfiguration,
    DateStepConfiguration,
    ProductStepConfiguration,
    ProductStepItem,
    QuestionnaireStepConfiguration,
)

logger = logging.getLogger(__name__)


class BookingFlowService:
    """Service for managing booking flows"""
    
    @staticmethod
    def get_all_flows(search_query=None, event_type_id=None, is_active=None):
        """Get all booking flows with optional filtering"""
        queryset = BookingFlow.objects.all()
        
        # Apply filters if provided
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query)
            )
        
        if event_type_id:
            queryset = queryset.filter(event_type_id=event_type_id)
            
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)
            
        return queryset.order_by('name')
    
    @staticmethod
    def get_flow_by_id(flow_id):
        """Get a booking flow by ID"""
        try:
            return BookingFlow.objects.get(id=flow_id)
        except BookingFlow.DoesNotExist:
            raise BookingFlowNotFound()
    
    @staticmethod
    def create_flow(flow_data):
        """Create a new booking flow"""
        steps_data = flow_data.pop('steps', [])
        
        with transaction.atomic():
            flow = BookingFlow.objects.create(**flow_data)
            
            # Create steps if provided
            for step_data in steps_data:
                BookingStepService.create_step(flow.id, step_data)
            
            logger.info(f"Created new booking flow: {flow.name}")
            return flow
    
    @staticmethod
    def update_flow(flow_id, flow_data):
        """Update an existing booking flow"""
        flow = BookingFlowService.get_flow_by_id(flow_id)
        steps_data = flow_data.pop('steps', None)
        
        with transaction.atomic():
            # Update flow fields
            for key, value in flow_data.items():
                setattr(flow, key, value)
            
            flow.save()
            
            # If steps provided, update them
            if steps_data is not None:
                # Delete existing steps
                flow.steps.all().delete()
                
                # Create new steps
                for step_data in steps_data:
                    BookingStepService.create_step(flow.id, step_data)
            
            logger.info(f"Updated booking flow: {flow.name}")
            return flow
    
    @staticmethod
    def delete_flow(flow_id):
        """Delete a booking flow"""
        flow = BookingFlowService.get_flow_by_id(flow_id)
        
        with transaction.atomic():
            flow_name = flow.name
            flow.delete()
            logger.info(f"Deleted booking flow: {flow_name}")
            return True


class BookingStepService:
    """Service for managing booking steps"""
    
    @staticmethod
    def get_steps_for_flow(flow_id):
        """Get all steps for a specific flow"""
        try:
            flow = BookingFlow.objects.get(id=flow_id)
            return flow.steps.all().order_by('order')
        except BookingFlow.DoesNotExist:
            raise BookingFlowNotFound()
    
    @staticmethod
    def get_step_by_id(step_id):
        """Get a booking step by ID"""
        try:
            return BookingStep.objects.get(id=step_id)
        except BookingStep.DoesNotExist:
            raise BookingStepNotFound()
    
    @staticmethod
    def create_step(flow_id, step_data):
        """Create a new booking step for a flow"""
        try:
            flow = BookingFlow.objects.get(id=flow_id)
        except BookingFlow.DoesNotExist:
            raise BookingFlowNotFound()
        
        # Extract configuration data based on step type
        questionnaire_config = step_data.pop('questionnaire_config', None)
        product_config = step_data.pop('product_config', None)
        date_config = step_data.pop('date_config', None)
        custom_config = step_data.pop('custom_config', None)
        product_items = []
        if product_config and 'product_items' in product_config:
            product_items = product_config.pop('product_items', [])
        
        # Auto-assign order if not provided
        if 'order' not in step_data:
            # Get the max order, default to 0 if none exist
            max_order = BookingStep.objects.filter(
                booking_flow=flow
            ).aggregate(Max('order'))['order__max'] or 0
            step_data['order'] = max_order + 1
        
        # Check for duplicate order
        same_order = BookingStep.objects.filter(
            booking_flow=flow,
            order=step_data['order']
        ).exists()
        
        if same_order:
            raise DuplicateStepOrder()
        
        with transaction.atomic():
            # Create the step
            step = BookingStep.objects.create(booking_flow=flow, **step_data)
            
            # Create configuration based on step type
            if step.step_type == 'QUESTIONNAIRE' and questionnaire_config:
                QuestionnaireStepConfiguration.objects.create(
                    step=step, **questionnaire_config
                )
            elif step.step_type in ['PRODUCT', 'ADDON'] and product_config:
                config = ProductStepConfiguration.objects.create(
                    step=step, **product_config
                )
                # Add product items
                for idx, item_data in enumerate(product_items):
                    ProductStepItem.objects.create(
                        config=config,
                        order=idx + 1,
                        **item_data
                    )
            elif step.step_type == 'DATE' and date_config:
                DateStepConfiguration.objects.create(
                    step=step, **date_config
                )
            elif step.step_type == 'CUSTOM' and custom_config:
                CustomStepConfiguration.objects.create(
                    step=step, **custom_config
                )
            
            logger.info(f"Created new booking step: {step.name} for flow: {flow.name}")
            return step
    
    @staticmethod
    def update_step(step_id, step_data):
        """Update an existing booking step"""
        step = BookingStepService.get_step_by_id(step_id)
        
        # Extract configuration data based on step type
        questionnaire_config = step_data.pop('questionnaire_config', None)
        product_config = step_data.pop('product_config', None)
        date_config = step_data.pop('date_config', None)
        custom_config = step_data.pop('custom_config', None)
        product_items = []
        if product_config and 'product_items' in product_config:
            product_items = product_config.pop('product_items', [])
        
        # Make a copy of step_data to avoid modifying the input
        step_data_copy = step_data.copy()
        
        # Handle booking flow if present
        booking_flow = step.booking_flow
        if 'booking_flow' in step_data_copy:
            if hasattr(step_data_copy['booking_flow'], 'id'):
                flow_id = step_data_copy['booking_flow'].id
            else:
                flow_id = step_data_copy['booking_flow']
                
            if flow_id != step.booking_flow.id:
                try:
                    booking_flow = BookingFlow.objects.get(id=flow_id)
                    step.booking_flow = booking_flow
                    step_data_copy.pop('booking_flow')
                except BookingFlow.DoesNotExist:
                    raise BookingFlowNotFound()
        
        # Check if order is being changed
        order_changed = False
        old_order = step.order
        new_order = None
        
        if 'order' in step_data_copy and int(step_data_copy['order']) != old_order:
            order_changed = True
            new_order = int(step_data_copy['order'])
        
        # Check if step type is being changed
        step_type_changed = False
        new_step_type = None
        
        if 'step_type' in step_data_copy and step_data_copy['step_type'] != step.step_type:
            step_type_changed = True
            new_step_type = step_data_copy['step_type']
        
        with transaction.atomic():
            # Special handling for order changes
            if order_changed:
                # Get all steps for this flow including our step
                all_steps = BookingStep.objects.filter(
                    booking_flow=booking_flow
                ).select_for_update()
                
                # Get the maximum order value
                max_order = all_steps.aggregate(Max('order'))['order__max'] or 0
                temp_start = max_order + 1000  # Use a very high temporary order
                
                # PHASE 1: Assign temporary high orders to all steps
                for i, s in enumerate(all_steps):
                    temp_order = temp_start + i
                    s.order = temp_order
                    s.save(update_fields=['order'])
                
                logger.info(f"Assigned temporary high orders to all steps in flow {booking_flow.name}")
                
                # Apply non-order changes to our step
                for key, value in step_data_copy.items():
                    if key != 'order':  # Skip order, we'll handle it separately
                        setattr(step, key, value)
                
                # Save if step type changed
                if step_type_changed:
                    step.save()
                
                # PHASE 2: Reorder all steps with sequential ordering
                # Make a list of steps in the desired order
                step_list = list(all_steps)
                
                # If our step was already in this list, remove it so we can insert it at the new position
                step_list = [s for s in step_list if s.id != step.id]
                
                # Determine where to insert our step
                insert_position = min(new_order - 1, len(step_list)) if new_order else 0
                
                # Insert our step at the desired position
                step_list.insert(insert_position, step)
                
                # Assign sequential orders
                for i, s in enumerate(step_list, start=1):
                    s.order = i
                    s.save(update_fields=['order'])
                
                logger.info(f"Reordered steps with step {step.name} at position {step.order}")
            else:
                # No order change - just apply updates normally
                for key, value in step_data_copy.items():
                    setattr(step, key, value)
                step.save()
            
            # Update configuration based on step type
            new_type = step.step_type if not step_type_changed else new_step_type
            
            # Delete old configurations if step type has changed
            if step_type_changed:
                # Delete existing configurations based on old type
                if hasattr(step, 'questionnaire_config'):
                    step.questionnaire_config.delete()
                if hasattr(step, 'product_config'):
                    step.product_config.delete()
                if hasattr(step, 'date_config'):
                    step.date_config.delete()
                if hasattr(step, 'custom_config'):
                    step.custom_config.delete()
            
            # Create or update configuration based on new step type
            if new_type == 'QUESTIONNAIRE' and questionnaire_config:
                if hasattr(step, 'questionnaire_config') and step.questionnaire_config:
                    # Update existing config
                    for key, value in questionnaire_config.items():
                        setattr(step.questionnaire_config, key, value)
                    step.questionnaire_config.save()
                else:
                    # Create new config
                    QuestionnaireStepConfiguration.objects.create(
                        step=step, **questionnaire_config
                    )
            elif new_type in ['PRODUCT', 'ADDON'] and product_config:
                if hasattr(step, 'product_config') and step.product_config:
                    # Update existing config
                    for key, value in product_config.items():
                        setattr(step.product_config, key, value)
                    step.product_config.save()
                    
                    # Delete existing product items and create new ones
                    step.product_config.product_items.all().delete()
                    
                    # Add new product items
                    for idx, item_data in enumerate(product_items):
                        ProductStepItem.objects.create(
                            config=step.product_config,
                            order=idx + 1,
                            **item_data
                        )
                else:
                    # Create new config
                    config = ProductStepConfiguration.objects.create(
                        step=step, **product_config
                    )
                    # Add product items
                    for idx, item_data in enumerate(product_items):
                        ProductStepItem.objects.create(
                            config=config,
                            order=idx + 1,
                            **item_data
                        )
            elif new_type == 'DATE' and date_config:
                if hasattr(step, 'date_config') and step.date_config:
                    # Update existing config
                    for key, value in date_config.items():
                        setattr(step.date_config, key, value)
                    step.date_config.save()
                else:
                    # Create new config
                    DateStepConfiguration.objects.create(
                        step=step, **date_config
                    )
            elif new_type == 'CUSTOM' and custom_config:
                if hasattr(step, 'custom_config') and step.custom_config:
                    # Update existing config
                    for key, value in custom_config.items():
                        setattr(step.custom_config, key, value)
                    step.custom_config.save()
                else:
                    # Create new config
                    CustomStepConfiguration.objects.create(
                        step=step, **custom_config
                    )
            
            logger.info(f"Updated booking step: {step.name} for flow: {step.booking_flow.name}")
            return step
    
    @staticmethod
    def reorder_steps(flow_id, order_mapping):
        """
        Reorder steps within a booking flow
        
        Args:
            flow_id: ID of the booking flow
            order_mapping: Dict mapping step IDs to their new order
        """
        try:
            flow = BookingFlow.objects.get(id=flow_id)
        except BookingFlow.DoesNotExist:
            raise BookingFlowNotFound()
        
        with transaction.atomic():
            # Get all steps for this flow
            steps = BookingStep.objects.filter(
                booking_flow=flow
            ).select_for_update().order_by('order')
            
            # Convert string IDs to integers in the order_mapping
            int_order_mapping = {int(k): v for k, v in order_mapping.items()}
            
            # Get the maximum existing order value
            max_order = steps.aggregate(max_order=models.Max('order'))['max_order'] or 0
            temp_start = max_order + 1000  # Start temp values well above existing ones
            
            # First, update all steps to have temporary very large order values
            # This avoids conflicts during reordering
            for i, step in enumerate(steps):
                temp_order = temp_start + i
                if step.id in int_order_mapping:
                    step.order = temp_order
                    step.save(update_fields=['order'])
            
            # Then update with final values
            for step in steps:
                if step.id in int_order_mapping:
                    new_order = int_order_mapping[step.id]
                    step.order = new_order
                    step.save(update_fields=['order'])
            
            logger.info(f"Reordered steps for booking flow: {flow.name}")
            return steps.order_by('order')
        
    @staticmethod
    def delete_step(step_id):
        """
        Delete a booking step and reorder remaining steps
        
        Args:
            step_id: ID of the step to delete
            
        Returns:
            bool: True if deletion was successful
            
        Raises:
            BookingStepNotFound: If the step doesn't exist
        """
        try:
            step = BookingStep.objects.get(id=step_id)
        except BookingStep.DoesNotExist:
            raise BookingStepNotFound()
        
        with transaction.atomic():
            # Store information for reordering and logging
            flow = step.booking_flow
            deleted_order = step.order
            step_name = step.name
            
            # Delete the step
            step.delete()
            
            # Reorder remaining steps to maintain sequential ordering
            remaining_steps = BookingStep.objects.filter(
                booking_flow=flow,
                order__gt=deleted_order
            ).select_for_update().order_by('order')
            
            # Decrease order by 1 for all steps that had higher order than the deleted step
            for remaining in remaining_steps:
                remaining.order -= 1
                remaining.save(update_fields=['order'])
            
            logger.info(f"Deleted booking step: {step_name} and reordered remaining steps")
            return True


class ProductStepItemService:
    """Service for managing product step items"""
    
    @staticmethod
    def get_items_for_config(config_id):
        """Get all product items for a specific configuration"""
        return ProductStepItem.objects.filter(config_id=config_id).order_by('order')
    
    @staticmethod
    def get_item_by_id(item_id):
        """Get a product step item by ID"""
        try:
            return ProductStepItem.objects.get(id=item_id)
        except ProductStepItem.DoesNotExist:
            raise ProductItemNotFound()
    
    @staticmethod
    def create_item(config_id, item_data):
        """Create a new product item for a configuration"""
        try:
            config = ProductStepConfiguration.objects.get(id=config_id)
        except ProductStepConfiguration.DoesNotExist:
            raise InvalidStepTypeForConfiguration("Product step configuration not found")
        
        # Auto-assign order if not provided
        if 'order' not in item_data:
            # Get the max order, default to 0 if none exist
            max_order = ProductStepItem.objects.filter(
                config=config
            ).aggregate(Max('order'))['order__max'] or 0
            item_data['order'] = max_order + 1
        
        # Check for duplicate order
        same_order = ProductStepItem.objects.filter(
            config=config,
            order=item_data['order']
        ).exists()
        
        if same_order:
            raise DuplicateStepOrder()
        
        item = ProductStepItem.objects.create(config=config, **item_data)
        logger.info(f"Created new product item for {config.step.name}")
        return item
    
    @staticmethod
    def update_item(item_id, item_data):
        """Update an existing product item"""
        item = ProductStepItemService.get_item_by_id(item_id)
        config = item.config
        
        # Check if order is being changed
        order_changed = False
        old_order = item.order
        new_order = None
        
        if 'order' in item_data and int(item_data['order']) != old_order:
            order_changed = True
            new_order = int(item_data['order'])
        
        with transaction.atomic():
            # Special handling for order changes
            if order_changed:
                # Get all items for this config including our item
                all_items = ProductStepItem.objects.filter(
                    config=config
                ).select_for_update()
                
                # Get the maximum order value
                max_order = all_items.aggregate(Max('order'))['order__max'] or 0
                temp_start = max_order + 1000  # Use a very high temporary order
                
                # PHASE 1: Assign temporary high orders to all items
                for i, itm in enumerate(all_items):
                    temp_order = temp_start + i
                    itm.order = temp_order
                    itm.save(update_fields=['order'])
                
                # Apply non-order changes to our item
                for key, value in item_data.items():
                    if key != 'order':  # Skip order, we'll handle it separately
                        setattr(item, key, value)
                
                # PHASE 2: Reorder all items with sequential ordering
                # Make a list of items in the desired order
                item_list = list(all_items)
                
                # If our item was already in this list, remove it so we can insert it at the new position
                item_list = [itm for itm in item_list if itm.id != item.id]
                
                # Determine where to insert our item
                insert_position = min(new_order - 1, len(item_list)) if new_order else 0
                
                # Insert our item at the desired position
                item_list.insert(insert_position, item)
                
                # Assign sequential orders
                for i, itm in enumerate(item_list, start=1):
                    itm.order = i
                    itm.save(update_fields=['order'])
                
                logger.info(f"Reordered product items with item at position {item.order}")
            else:
                # No order change - just apply updates normally
                for key, value in item_data.items():
                    setattr(item, key, value)
                item.save()
            
            logger.info(f"Updated product item for {config.step.name}")
            return item
    
    @staticmethod
    def reorder_items(config_id, order_mapping):
        """
        Reorder product items for a configuration
        
        Args:
            config_id: ID of the product step configuration
            order_mapping: Dict mapping item IDs to their new order
        """
        try:
            config = ProductStepConfiguration.objects.get(id=config_id)
        except ProductStepConfiguration.DoesNotExist:
            raise InvalidStepTypeForConfiguration("Product step configuration not found")
        
        with transaction.atomic():
            # Get all items for this config
            items = ProductStepItem.objects.filter(
                config=config
            ).select_for_update().order_by('order')
            
            # Convert string IDs to integers in the order_mapping
            int_order_mapping = {int(k): v for k, v in order_mapping.items()}
            
            # Get the maximum existing order value
            max_order = items.aggregate(max_order=models.Max('order'))['max_order'] or 0
            temp_start = max_order + 1000  # Start temp values well above existing ones
            
            # First, update all items to have temporary very large order values
            # This avoids conflicts during reordering
            for i, item in enumerate(items):
                temp_order = temp_start + i
                if item.id in int_order_mapping:
                    item.order = temp_order
                    item.save(update_fields=['order'])
            
            # Then update with final values
            for item in items:
                if item.id in int_order_mapping:
                    new_order = int_order_mapping[item.id]
                    item.order = new_order
                    item.save(update_fields=['order'])
            
            logger.info(f"Reordered product items for step: {config.step.name}")
            return items.order_by('order')
    
    @staticmethod
    def delete_item(item_id):
        """
        Delete a product item and reorder remaining items
        
        Args:
            item_id: ID of the item to delete
            
        Returns:
            bool: True if deletion was successful
            
        Raises:
            ProductItemNotFound: If the item doesn't exist
        """
        try:
            item = ProductStepItem.objects.get(id=item_id)
        except ProductStepItem.DoesNotExist:
            raise ProductItemNotFound()
        
        with transaction.atomic():
            # Store information for reordering and logging
            config = item.config
            deleted_order = item.order
            
            # Delete the item
            item.delete()
            
            # Reorder remaining items to maintain sequential ordering
            remaining_items = ProductStepItem.objects.filter(
                config=config,
                order__gt=deleted_order
            ).select_for_update().order_by('order')
            
            # Decrease order by 1 for all items that had higher order than the deleted item
            for remaining in remaining_items:
                remaining.order -= 1
                remaining.save(update_fields=['order'])
            
            logger.info(f"Deleted product item and reordered remaining items for {config.step.name}")
            return True
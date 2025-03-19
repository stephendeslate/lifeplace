# backend/core/domains/communications/views.py
from core.utils.permissions import IsAdmin
from django.template import Context, Template
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import EmailRecord, EmailTemplate
from .serializers import (
    EmailRecordSerializer,
    EmailTemplateSerializer,
    PreviewEmailTemplateSerializer,
)
from .services import EmailTemplateService


class EmailTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for EmailTemplate model
    """
    queryset = EmailTemplate.objects.all().order_by('-updated_at')
    serializer_class = EmailTemplateSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by name if provided in query params
        name = self.request.query_params.get('name', None)
        if name:
            queryset = queryset.filter(name__icontains=name)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Use service to create template
        template = EmailTemplateService.create_template(serializer.validated_data)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            self.get_serializer(template).data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Use service to update template
        template = EmailTemplateService.update_template(
            instance.id, 
            serializer.validated_data
        )
        
        return Response(self.get_serializer(template).data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check if it's a system template that shouldn't be deleted
        if instance.name in ['Admin Invitation']:
            return Response(
                {"error": "Cannot delete system template."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use service to delete template
        EmailTemplateService.delete_template(instance.id)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def preview(self, request, pk=None):
        """
        Preview an email template with sample data
        """
        serializer = PreviewEmailTemplateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Get context data or use defaults
            context_data = serializer.validated_data.get('context_data', {})
            
            try:
                # Use service to preview template
                preview_data = EmailTemplateService.preview_template(
                    pk, 
                    context_data
                )
                
                return Response(preview_data)
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def admin_invitation(self, request):
        """
        Get the admin invitation email template
        """
        try:
            template = EmailTemplate.objects.get(name='Admin Invitation')
            serializer = self.get_serializer(template)
            
            # Also include available variables
            available_variables = {
                'first_name': 'Invitee first name',
                'last_name': 'Invitee last name',
                'invitation_link': 'Link to accept invitation',
                'invited_by': 'Name of admin who sent invitation',
                'expiry_date': 'Expiration period for the invitation'
            }
            
            return Response({
                'template': serializer.data,
                'available_variables': available_variables
            })
        except EmailTemplate.DoesNotExist:
            return Response(
                {'error': 'Admin invitation template not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def get_variable_options(self, request):
        """
        Get available template variables for different template types
        """
        template_type = request.query_params.get('type', 'generic')
        
        # Common variables available for all templates
        common_variables = {
            'current_date': 'Current date',
            'site_name': 'Name of the site (LifePlace)',
            'site_url': 'URL of the site'
        }
        
        # Template-specific variables
        template_variables = {
            'admin_invitation': {
                'first_name': 'Invitee first name',
                'last_name': 'Invitee last name',
                'invitation_link': 'Link to accept invitation',
                'invited_by': 'Name of admin who sent invitation',
                'expiry_date': 'Expiration period for the invitation'
            },
            'password_reset': {
                'first_name': 'User first name',
                'reset_link': 'Password reset link',
                'expiry_time': 'Time until the reset link expires'
            },
            'welcome': {
                'first_name': 'User first name',
                'last_name': 'User last name',
                'login_link': 'Link to login page'
            },
            'generic': {}
        }
        
        # Get variables for the requested template type, defaulting to generic
        variables = {**common_variables, **template_variables.get(template_type, {})}
        
        return Response(variables)


class EmailRecordViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for EmailRecord model (read-only)
    """
    queryset = EmailRecord.objects.all().order_by('-sent_at')
    serializer_class = EmailRecordSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by template_name if provided
        template_name = self.request.query_params.get('template_name', None)
        if template_name:
            queryset = queryset.filter(name=template_name)
            
        # Filter by status if provided
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset
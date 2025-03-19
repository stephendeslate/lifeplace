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


class EmailTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for EmailTemplate model
    """
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [IsAdmin]
    
    @action(detail=True, methods=['post'])
    def preview(self, request, pk=None):
        """
        Preview an email template with sample data
        """
        template = self.get_object()
        serializer = PreviewEmailTemplateSerializer(data=request.data)
        
        if serializer.is_valid():
            # Get context data or use defaults
            context_data = serializer.validated_data.get('context_data', {})
            
            # Default context for admin invitation if none provided
            if template.name == 'Admin Invitation' and not context_data:
                context_data = {
                    'first_name': 'John',
                    'last_name': 'Doe',
                    'invitation_link': 'https://lifeplace.com/accept-invitation/abc123',
                    'invited_by': 'Admin User',
                    'expiry_date': '7 days'
                }
            
            # Render template
            try:
                django_template = Template(template.body)
                rendered_body = django_template.render(Context(context_data))
                
                django_subject_template = Template(template.subject)
                rendered_subject = django_subject_template.render(Context(context_data))
                
                return Response({
                    'subject': rendered_subject,
                    'body': rendered_body
                })
            except Exception as e:
                return Response(
                    {'error': f'Error rendering template: {str(e)}'},
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
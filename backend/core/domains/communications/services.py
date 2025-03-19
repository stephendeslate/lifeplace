# backend/core/domains/communications/services.py
import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template import Context, Template
from django.template.exceptions import TemplateSyntaxError
from django.utils import timezone

from .exceptions import InvalidTemplateFormat, TemplateNameExists, TemplateNotFound
from .models import EmailRecord, EmailTemplate

logger = logging.getLogger(__name__)

class EmailTemplateService:
    """Service for managing email templates"""
    
    @staticmethod
    def get_all_templates():
        """Get all email templates"""
        return EmailTemplate.objects.all().order_by('-updated_at')
    
    @staticmethod
    def get_template_by_id(template_id):
        """Get an email template by ID"""
        try:
            return EmailTemplate.objects.get(id=template_id)
        except EmailTemplate.DoesNotExist:
            raise TemplateNotFound()
    
    @staticmethod
    def get_template_by_name(name):
        """Get an email template by name"""
        try:
            return EmailTemplate.objects.get(name=name)
        except EmailTemplate.DoesNotExist:
            raise TemplateNotFound()
    
    @staticmethod
    def create_template(template_data):
        """Create a new email template"""
        # Check if template with name already exists
        if EmailTemplate.objects.filter(name__iexact=template_data['name']).exists():
            raise TemplateNameExists()
        
        # Validate template syntax
        try:
            subject_template = Template(template_data['subject'])
            body_template = Template(template_data['body'])
        except TemplateSyntaxError as e:
            logger.error(f"Template syntax error: {str(e)}")
            raise InvalidTemplateFormat(detail=f"Template syntax error: {str(e)}")
        
        # Create template
        return EmailTemplate.objects.create(**template_data)
    
    @staticmethod
    def update_template(template_id, template_data):
        """Update an existing email template"""
        template = EmailTemplateService.get_template_by_id(template_id)
        
        # Check if name is being changed and if it would conflict
        if 'name' in template_data and template_data['name'] != template.name:
            if EmailTemplate.objects.filter(name__iexact=template_data['name']).exists():
                raise TemplateNameExists()
        
        # Validate template syntax if subject or body is being updated
        try:
            if 'subject' in template_data:
                subject_template = Template(template_data['subject'])
            if 'body' in template_data:
                body_template = Template(template_data['body'])
        except TemplateSyntaxError as e:
            logger.error(f"Template syntax error: {str(e)}")
            raise InvalidTemplateFormat(detail=f"Template syntax error: {str(e)}")
        
        # Update template fields
        for key, value in template_data.items():
            setattr(template, key, value)
        
        template.save()
        return template
    
    @staticmethod
    def delete_template(template_id):
        """Delete an email template"""
        template = EmailTemplateService.get_template_by_id(template_id)
        template.delete()
        return True
    
    @staticmethod
    def preview_template(template_id, context_data=None):
        """Preview an email template with sample data"""
        template = EmailTemplateService.get_template_by_id(template_id)
        
        if context_data is None:
            context_data = {}
        
        try:
            django_template = Template(template.body)
            rendered_body = django_template.render(Context(context_data))
            
            django_subject_template = Template(template.subject)
            rendered_subject = django_subject_template.render(Context(context_data))
            
            return {
                'subject': rendered_subject,
                'body': rendered_body
            }
        except Exception as e:
            logger.error(f"Error rendering template: {str(e)}")
            raise InvalidTemplateFormat(detail=f"Error rendering template: {str(e)}")


class EmailService:
    """Service for handling email operations"""
    
    @staticmethod
    def get_template(template_name):
        """Get an email template by name"""
        try:
            return EmailTemplate.objects.get(name=template_name)
        except EmailTemplate.DoesNotExist:
            logger.error(f"Email template '{template_name}' not found")
            return None
    
    @staticmethod
    def render_template(template, context_data):
        """Render an email template with context data"""
        if not template:
            return None, None
            
        # Render subject and body
        subject_template = Template(template.subject)
        body_template = Template(template.body)
        
        try:
            ctx = Context(context_data)
            subject = subject_template.render(ctx)
            body = body_template.render(ctx)
            return subject, body
        except Exception as e:
            logger.error(f"Error rendering template: {str(e)}")
            return None, None
    
    @staticmethod
    def send_email(template_name, recipient, context_data, sender=None, attachments=None, 
                   event=None, user=None, is_html=True):
        """
        Send an email using a template
        
        Args:
            template_name: Name of the email template
            recipient: Email address of the recipient
            context_data: Dictionary of context data for template rendering
            sender: Email address of the sender (optional)
            attachments: List of attachments (optional)
            event: Event associated with the email (optional)
            user: User sending the email (optional)
            is_html: Whether the email body is HTML (default True)
            
        Returns:
            EmailRecord instance if successful, None otherwise
        """
        # Get template
        template = EmailService.get_template(template_name)
        if not template:
            return None
            
        # Render template
        subject, body = EmailService.render_template(template, context_data)
        if not subject or not body:
            return None
        
        # Prepare email
        from_email = sender or settings.DEFAULT_FROM_EMAIL
        
        # Create email record
        email_record = EmailRecord.objects.create(
            name=template_name,
            subject=subject,
            body=body,
            attachments=template.attachments if attachments is None else attachments,
            client=context_data.get('user') if 'user' in context_data else None,
            event=event,
            sent_by=user,
            status='SCHEDULED'
        )
        
        # Send email
        try:
            email = EmailMultiAlternatives(
                subject=subject,
                body=body if not is_html else None,
                from_email=from_email,
                to=[recipient]
            )
            
            if is_html:
                email.attach_alternative(body, "text/html")
            
            # Add attachments
            # This would need to be implemented based on how attachments are stored
            
            # Send email
            email.send()
            
            # Update record
            email_record.status = 'SENT'
            email_record.sent_at = timezone.now()
            email_record.save()
            
            return email_record
            
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            email_record.status = 'FAILED'
            email_record.save()
            return None
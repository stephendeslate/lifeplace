# backend/core/domains/users/services.py
import uuid
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Q
from django.template.loader import render_to_string
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from .exceptions import (
    EmailAlreadyExists,
    InvitationAlreadyAccepted,
    InvitationExpired,
    UserNotFound,
)
from .models import AdminInvitation, User, UserProfile


class UserService:
    @staticmethod
    def get_users(search_query=None):
        """Get all users with optional search filter"""
        queryset = User.objects.all()
        
        if search_query:
            queryset = queryset.filter(
                Q(email__icontains=search_query) |
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query)
            )
            
        return queryset
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get a user by ID"""
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise UserNotFound()
    
    @staticmethod
    def get_user_by_email(email):
        """Get a user by email"""
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            raise UserNotFound()
    
    @staticmethod
    def create_user(user_data):
        """Create a new user"""
        # Check if email exists
        if User.objects.filter(email=user_data.get('email')).exists():
            raise EmailAlreadyExists()
            
        profile_data = user_data.pop('profile', {})
        user = User.objects.create_user(**user_data)
        
        # Create profile
        UserProfile.objects.create(user=user, **profile_data)
        
        return user
    
    @staticmethod
    def update_user(user, user_data):
        """Update a user"""
        profile_data = user_data.pop('profile', None)
        
        # Update user fields
        for key, value in user_data.items():
            setattr(user, key, value)
            
        if 'password' in user_data:
            user.set_password(user_data['password'])
            
        user.save()
        
        # Update or create profile if data provided
        if profile_data:
            if hasattr(user, 'profile') and user.profile is not None:
                # Update existing profile
                for key, value in profile_data.items():
                    setattr(user.profile, key, value)
                user.profile.save()
            else:
                # Create new profile if it doesn't exist
                from .models import UserProfile
                UserProfile.objects.create(user=user, **profile_data)
            
        return user
    
    @staticmethod
    def delete_user(user):
        """Delete a user"""
        user.is_active = False
        user.save()
        return True

    @staticmethod
    def get_tokens_for_user(user, remember_me=False):
        """Get JWT tokens for a user"""
        refresh = RefreshToken.for_user(user)
        
        # If remember_me is True, extend the token lifetime
        if remember_me:
            refresh.set_exp(lifetime=timedelta(days=7))
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class AdminInvitationService:
    @staticmethod
    def create_invitation(email, first_name, last_name, invited_by):
        """Create a new admin invitation"""
        # Check if user with email already exists
        if User.objects.filter(email=email).exists():
            raise EmailAlreadyExists()
            
        # Check if there's an active invitation for this email
        if AdminInvitation.objects.filter(email=email, is_accepted=False).exists():
            # Cancel the existing invitation and create a new one
            AdminInvitation.objects.filter(email=email).delete()
        
        # Create new invitation
        invitation = AdminInvitation.objects.create(
            email=email,
            first_name=first_name,
            last_name=last_name,
            invited_by=invited_by,
            expires_at=timezone.now() + timedelta(days=7)
        )
        
        # Send invitation email
        AdminInvitationService._send_invitation_email(invitation)
        
        return invitation
    
    @staticmethod
    def accept_invitation(invitation_id, password):
        """Accept an invitation and create a user"""
        try:
            invitation = AdminInvitation.objects.get(id=invitation_id, is_accepted=False)
        except AdminInvitation.DoesNotExist:
            raise UserNotFound("Invitation not found or already accepted.")
        
        # Check if invitation is expired
        if invitation.is_expired():
            raise InvitationExpired()
            
        # Create new admin user
        user = User.objects.create_user(
            email=invitation.email,
            password=password,
            first_name=invitation.first_name,
            last_name=invitation.last_name,
            role='ADMIN',
            is_staff=True  # Admin users should have staff access
        )
        
        # Mark invitation as accepted
        invitation.is_accepted = True
        invitation.save()
        
        return user
    
    @staticmethod
    def get_invitation_by_id(invitation_id):
        """Get an invitation by ID"""
        try:
            return AdminInvitation.objects.get(id=invitation_id)
        except AdminInvitation.DoesNotExist:
            raise UserNotFound("Invitation not found.")
    
    @staticmethod
    def _send_invitation_email(invitation):
        """Send invitation email to new admin"""
        subject = "You've been invited to join LifePlace Admin"
        invitation_link = f"{settings.ADMIN_FRONTEND_URL}/accept-invitation/{invitation.id}"
        
        # Create email content from template
        # You would normally have an HTML template for this
        html_message = f"""
        <h2>You've been invited to join LifePlace Admin</h2>
        <p>Hello {invitation.first_name} {invitation.last_name},</p>
        <p>{invitation.invited_by.get_full_name()} has invited you to join LifePlace as an administrator.</p>
        <p>Please click the link below to accept the invitation:</p>
        <a href="{invitation_link}">Accept Invitation</a>
        <p>This invitation will expire in 7 days.</p>
        <p>Thank you,<br>The LifePlace Team</p>
        """
        
        plain_message = f"""
        You've been invited to join LifePlace Admin
        
        Hello {invitation.first_name} {invitation.last_name},
        
        {invitation.invited_by.get_full_name()} has invited you to join LifePlace as an administrator.
        
        Please click the link below to accept the invitation:
        {invitation_link}
        
        This invitation will expire in 7 days.
        
        Thank you,
        The LifePlace Team
        """
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[invitation.email],
            html_message=html_message,
            fail_silently=False,
        )
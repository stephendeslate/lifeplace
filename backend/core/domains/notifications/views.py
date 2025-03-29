# backend/core/domains/notifications/views.py
from core.utils.permissions import IsAdmin
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Notification,
    NotificationPreference,
    NotificationTemplate,
    NotificationType,
)
from .serializers import (
    NotificationBulkActionSerializer,
    NotificationCountSerializer,
    NotificationPreferenceSerializer,
    NotificationSerializer,
    NotificationTemplateSerializer,
    NotificationTypeSerializer,
)
from .services import NotificationService


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user notifications"""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter by read status if specified
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            is_read = is_read.lower() == 'true'
            return Notification.objects.filter(
                recipient=user, 
                is_read=is_read
            ).select_related('notification_type')
        
        # Filter by notification type if specified
        notification_type = self.request.query_params.get('type')
        if notification_type:
            return Notification.objects.filter(
                recipient=user,
                notification_type__code=notification_type
            ).select_related('notification_type')
        
        # Return all user notifications by default
        return Notification.objects.filter(
            recipient=user
        ).select_related('notification_type')
    
    def list(self, request, *args, **kwargs):
        """Get notifications for the current user"""
        return super().list(request, *args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        """Get a specific notification and mark it as read"""
        notification = self.get_object()
        
        # Mark as read if not already read
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at', 'updated_at'])
        
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Create notification - restricted to admin users"""
        if not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to create notifications."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Update notification - restricted to admin users"""
        if not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to update notifications."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete a notification"""
        # Allow users to delete their own notifications
        notification = self.get_object()
        if notification.recipient != request.user and not request.user.is_staff:
            return Response(
                {"detail": "You do not have permission to delete this notification."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = NotificationService.mark_as_read(pk, request.user)
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        """Mark a notification as unread"""
        notification = NotificationService.mark_as_unread(pk, request.user)
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        count = NotificationService.mark_all_as_read(request.user)
        return Response({'marked_read': count})
    
    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """Perform bulk actions on notifications"""
        serializer = NotificationBulkActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        count = NotificationService.bulk_action(
            request.user.id,
            serializer.validated_data['notification_ids'],
            serializer.validated_data['action']
        )
        
        return Response({
            'action': serializer.validated_data['action'],
            'count': count
        })
    
    @action(detail=False, methods=['get'])
    def counts(self, request):
        """Get notification counts for the current user"""
        counts = NotificationService.get_notification_counts(request.user.id)
        serializer = NotificationCountSerializer(counts)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications for the current user"""
        notifications = NotificationService.get_notifications(request.user, is_read=False)
        page = self.paginate_queryset(notifications)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent notifications for the current user"""
        limit = int(request.query_params.get('limit', 5))
        notifications = NotificationService.get_notifications(request.user, limit=limit)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)


class NotificationTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notification types - admin only"""
    queryset = NotificationType.objects.all()
    serializer_class = NotificationTypeSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notification templates - admin only"""
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by notification type if specified
        notification_type = self.request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type__code=notification_type)
            
        # Filter by active status if specified
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
            
        return queryset


class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notification preferences"""
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Regular users can only see their own preferences
        if not self.request.user.is_staff:
            return NotificationPreference.objects.filter(user=self.request.user)
        
        # Admins can see all preferences
        return NotificationPreference.objects.all()
    
    @action(detail=False, methods=['get'])
    def my_preferences(self, request):
        """Get preferences for the current user"""
        preferences = NotificationService.get_or_create_user_preferences(request.user.id)
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_preferences(self, request):
        """Update preferences for the current user"""
        preferences = NotificationService.update_user_preferences(
            request.user.id, 
            request.data
        )
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)
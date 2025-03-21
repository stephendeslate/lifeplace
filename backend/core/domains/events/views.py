# backend/core/domains/events/views.py
from core.utils.permissions import IsAdmin
from rest_framework import filters, viewsets

from .models import EventType
from .serializers import EventTypeSerializer


class EventTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for event types
    """
    queryset = EventType.objects.all().order_by('name')
    serializer_class = EventTypeSerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by is_active if provided
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
            
        return queryset
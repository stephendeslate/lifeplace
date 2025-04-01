# backend/core/domains/dashboard/views.py
from core.utils.permissions import IsAdmin
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .exceptions import DashboardDataError, DateRangeInvalid
from .models import DashboardPreference
from .serializers import DashboardDataSerializer, DashboardPreferenceSerializer
from .services import DashboardService


class DashboardViewSet(viewsets.ViewSet):
    """
    ViewSet for dashboard data
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get dashboard summary data
        """
        time_range = request.query_params.get('time_range', 'week')
        
        try:
            dashboard_data = DashboardService.get_dashboard_data(time_range, request.user)
            return Response(dashboard_data)
        except DateRangeInvalid as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"detail": f"Failed to retrieve dashboard data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def events(self, request):
        """
        Get events overview data
        """
        time_range = request.query_params.get('time_range', 'week')
        
        try:
            start_date, end_date = DashboardService.get_date_range(time_range)
            events_data = DashboardService.get_events_overview(start_date, end_date, request.user)
            return Response(events_data)
        except DateRangeInvalid as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"detail": f"Failed to retrieve events data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def revenue(self, request):
        """
        Get revenue overview data
        """
        time_range = request.query_params.get('time_range', 'week')
        
        try:
            start_date, end_date = DashboardService.get_date_range(time_range)
            revenue_data = DashboardService.get_revenue_overview(start_date, end_date, request.user)
            return Response(revenue_data)
        except DateRangeInvalid as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"detail": f"Failed to retrieve revenue data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def clients(self, request):
        """
        Get clients overview data
        """
        time_range = request.query_params.get('time_range', 'week')
        
        try:
            start_date, end_date = DashboardService.get_date_range(time_range)
            clients_data = DashboardService.get_clients_overview(start_date, end_date, request.user)
            return Response(clients_data)
        except DateRangeInvalid as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"detail": f"Failed to retrieve clients data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def tasks(self, request):
        """
        Get tasks overview data
        """
        time_range = request.query_params.get('time_range', 'week')
        
        try:
            start_date, end_date = DashboardService.get_date_range(time_range)
            tasks_data = DashboardService.get_tasks_overview(start_date, end_date, request.user)
            return Response(tasks_data)
        except DateRangeInvalid as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"detail": f"Failed to retrieve tasks data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def activity(self, request):
        """
        Get recent activity data
        """
        limit = int(request.query_params.get('limit', 10))
        
        try:
            activity_data = DashboardService.get_recent_activity(limit, request.user)
            return Response(activity_data)
        except Exception as e:
            return Response(
                {"detail": f"Failed to retrieve activity data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def metrics(self, request):
        """
        Get key metrics data
        """
        time_range = request.query_params.get('time_range', 'week')
        
        try:
            start_date, end_date = DashboardService.get_date_range(time_range)
            metrics_data = DashboardService.get_key_metrics(start_date, end_date, request.user)
            return Response(metrics_data)
        except DateRangeInvalid as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"detail": f"Failed to retrieve metrics data: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class DashboardPreferenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for dashboard preferences
    """
    serializer_class = DashboardPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only the current user's preference"""
        return DashboardPreference.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_preferences(self, request):
        """
        Get current user's dashboard preferences
        """
        preference = DashboardService.get_user_preference(request.user.id)
        serializer = self.get_serializer(preference)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_preferences(self, request):
        """
        Update current user's dashboard preferences
        """
        try:
            preference = DashboardService.update_user_preference(
                request.user.id,
                request.data
            )
            serializer = self.get_serializer(preference)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"detail": f"Failed to update preferences: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
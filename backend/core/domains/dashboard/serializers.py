# backend/core/domains/dashboard/serializers.py
from core.domains.clients.serializers import ClientListSerializer
from core.domains.events.serializers import EventSerializer, EventTaskSerializer
from core.domains.payments.serializers import PaymentSerializer
from rest_framework import serializers

from .models import DashboardPreference


class DashboardPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for user dashboard preferences"""
    
    class Meta:
        model = DashboardPreference
        fields = ['id', 'layout', 'default_time_range', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class DashboardMetricSerializer(serializers.Serializer):
    """Serializer for simple dashboard metrics"""
    
    label = serializers.CharField()
    value = serializers.SerializerMethodField()
    change = serializers.FloatField(allow_null=True)  # Percentage change
    trend = serializers.CharField(allow_null=True)  # 'up', 'down', or 'flat'
    comparison_label = serializers.CharField(allow_null=True)
    
    def get_value(self, obj):
        """Format the value based on type"""
        if obj.get('type') == 'money':
            return f"${obj.get('value', 0)}"
        elif obj.get('type') == 'percentage':
            return f"{obj.get('value', 0)}%"
        else:
            return obj.get('value', 0)


class ChartDataSerializer(serializers.Serializer):
    """Serializer for chart data"""
    
    chart_type = serializers.CharField()  # 'line', 'bar', 'pie', etc.
    title = serializers.CharField()
    labels = serializers.ListField(child=serializers.CharField())
    datasets = serializers.ListField(child=serializers.DictField())
    options = serializers.DictField(required=False)


class EventsOverviewSerializer(serializers.Serializer):
    """Serializer for events overview"""
    
    total_events = serializers.IntegerField()
    events_by_status = serializers.DictField(child=serializers.IntegerField())
    upcoming_events = EventSerializer(many=True)
    events_trend = ChartDataSerializer()


class RevenueOverviewSerializer(serializers.Serializer):
    """Serializer for revenue overview"""
    
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    revenue_by_status = serializers.DictField(child=serializers.DecimalField(max_digits=10, decimal_places=2))
    recent_payments = PaymentSerializer(many=True)
    revenue_trend = ChartDataSerializer()
    payment_summary = serializers.DictField()


class ClientsOverviewSerializer(serializers.Serializer):
    """Serializer for clients overview"""
    
    total_clients = serializers.IntegerField()
    active_clients = serializers.IntegerField()
    new_clients = serializers.IntegerField()
    clients_trend = ChartDataSerializer()
    recent_clients = ClientListSerializer(many=True)


class TasksOverviewSerializer(serializers.Serializer):
    """Serializer for tasks overview"""
    
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()
    urgent_tasks = serializers.IntegerField()
    tasks_by_status = serializers.DictField(child=serializers.IntegerField())
    upcoming_tasks = EventTaskSerializer(many=True)


class DashboardDataSerializer(serializers.Serializer):
    """Serializer for complete dashboard data"""
    
    time_range = serializers.CharField()
    events_overview = EventsOverviewSerializer()
    revenue_overview = RevenueOverviewSerializer()
    clients_overview = ClientsOverviewSerializer()
    tasks_overview = TasksOverviewSerializer()
    key_metrics = serializers.ListField(child=DashboardMetricSerializer())
    recent_activity = serializers.ListField(child=serializers.DictField())
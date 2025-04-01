# backend/core/domains/dashboard/models.py
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class DashboardPreference(models.Model):
    """Model for storing user dashboard preferences"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='dashboard_preference')
    
    # Layout preferences as JSON
    # Example: {"widgets": ["upcoming_events", "revenue", "tasks"], "layout": {"upcoming_events": {"position": 1}}}
    layout = models.JSONField(default=dict)
    
    # Time range preferences for dashboard data
    DEFAULT_TIME_RANGE = 'week'
    TIME_RANGE_CHOICES = [
        ('day', 'Today'),
        ('week', 'This Week'),
        ('month', 'This Month'),
        ('quarter', 'This Quarter'),
        ('year', 'This Year'),
    ]
    
    default_time_range = models.CharField(
        max_length=10,
        choices=TIME_RANGE_CHOICES,
        default=DEFAULT_TIME_RANGE
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Dashboard Preferences for {self.user.email}"
    
    @property
    def enabled_widgets(self):
        """Return list of enabled widgets"""
        return self.layout.get('widgets', [])
    
    @property
    def widget_layout(self):
        """Return widget layout configuration"""
        return self.layout.get('layout', {})
    
    @classmethod
    def get_default_layout(cls):
        """Return the default dashboard layout"""
        return {
            "widgets": [
                "upcoming_events",
                "revenue_summary",
                "tasks_summary",
                "client_stats",
                "recent_activity",
                "notifications"
            ],
            "layout": {
                "upcoming_events": {"position": 1, "size": "medium"},
                "revenue_summary": {"position": 2, "size": "medium"},
                "tasks_summary": {"position": 3, "size": "small"},
                "client_stats": {"position": 4, "size": "small"},
                "recent_activity": {"position": 5, "size": "large"},
                "notifications": {"position": 6, "size": "medium"}
            }
        }
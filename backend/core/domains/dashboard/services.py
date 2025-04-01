import logging
from datetime import datetime, timedelta
from decimal import Decimal

from core.domains.clients.models import User
from core.domains.events.models import Event, EventTask, EventTimeline
from core.domains.payments.models import Payment
from django.db import models
from django.db.models import (
    Case,
    Count,
    DecimalField,
    ExpressionWrapper,
    F,
    Q,
    Sum,
    Value,
    When,
)
from django.utils import timezone

from .exceptions import DashboardPreferenceNotFound, DateRangeInvalid
from .models import DashboardPreference

logger = logging.getLogger(__name__)

class DashboardService:
    """Service for dashboard operations"""
    
    @staticmethod
    def get_date_range(time_range):
        """
        Get start and end dates based on time range
        """
        today = timezone.now().date()
        
        if time_range == 'day':
            return today, today
        elif time_range == 'week':
            start_date = today - timedelta(days=today.weekday())
            return start_date, today
        elif time_range == 'month':
            start_date = today.replace(day=1)
            return start_date, today
        elif time_range == 'quarter':
            current_quarter = (today.month - 1) // 3 + 1
            start_month = (current_quarter - 1) * 3 + 1
            start_date = today.replace(month=start_month, day=1)
            return start_date, today
        elif time_range == 'year':
            start_date = today.replace(month=1, day=1)
            return start_date, today
        else:
            raise DateRangeInvalid(f"Invalid time range: {time_range}")
    
    @staticmethod
    def get_previous_period(start_date, end_date):
        """
        Get start and end dates for the previous comparable period
        """
        period_length = (end_date - start_date).days + 1
        prev_end_date = start_date - timedelta(days=1)
        prev_start_date = prev_end_date - timedelta(days=period_length - 1)
        return prev_start_date, prev_end_date
    
    @staticmethod
    def calculate_percentage_change(current, previous):
        """
        Calculate percentage change between two values
        """
        if previous == 0 or previous is None:
            return None
        change = ((current - previous) / previous) * 100
        return round(change, 2)
    
    @staticmethod
    def get_events_overview(start_date, end_date, user=None):
        """
        Get events overview data for the dashboard
        """
        events_query = Event.objects.filter(
            start_date__gte=start_date,
            start_date__lte=end_date
        )
        
        events_by_status = {
            status: events_query.filter(status=status).count()
            for status, _ in Event.EVENT_STATUSES
        }
        
        today = timezone.now().date()
        upcoming_events_qs = Event.objects.filter(
            start_date__gte=today
        ).order_by('start_date')
        
        # Serialize upcoming events
        upcoming_events = [
            {
                "id": event.id,
                "name": event.name,
                "start_date": event.start_date.isoformat(),
                "status": event.status
            }
            for event in upcoming_events_qs
        ]
        
        prev_start_date, prev_end_date = DashboardService.get_previous_period(start_date, end_date)
        
        current_total = events_query.count()
        previous_total = Event.objects.filter(
            start_date__gte=prev_start_date,
            start_date__lte=prev_end_date
        ).count()
        
        change = DashboardService.calculate_percentage_change(current_total, previous_total)
        
        trend_days = 7
        trend_start = today - timedelta(days=trend_days - 1)
        trend_dates = [(trend_start + timedelta(days=i)).strftime('%Y-%m-%d') 
                       for i in range(trend_days)]
        
        trend_data = {
            "chart_type": "line",
            "title": "Events Trend",
            "labels": trend_dates,
            "datasets": [
                {
                    "label": "New Events",
                    "data": [
                        Event.objects.filter(created_at=trend_start + timedelta(days=i)).count()
                        for i in range(trend_days)
                    ],
                    "borderColor": "#4CAF50",
                    "backgroundColor": "rgba(76, 175, 80, 0.1)"
                }
            ]
        }
        
        return {
            "total_events": current_total,
            "events_by_status": events_by_status,
            "upcoming_events": upcoming_events,
            "events_trend": trend_data,
            "change": change,
            "trend": "up" if change and change > 0 else "down" if change and change < 0 else "flat",
            "comparison_label": f"vs. previous {(end_date - start_date).days + 1} days"
        }
    
    @staticmethod
    def get_revenue_overview(start_date, end_date, user=None):
        """
        Get revenue overview data for the dashboard
        """
        payments_query = Payment.objects.filter(
            status='COMPLETED',
            paid_on__gte=start_date,
            paid_on__lte=end_date
        )
        
        total_revenue = payments_query.aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        
        revenue_by_status = {
            'pending': Payment.objects.filter(
                status='PENDING',
                due_date__gte=start_date,
                due_date__lte=end_date
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00'),
            'completed': total_revenue,
            'failed': Payment.objects.filter(
                status='FAILED',
                created_at__gte=start_date,
                created_at__lte=end_date
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        }
        
        recent_payments_qs = payments_query.order_by('-paid_on')[:5]
        
        # Serialize recent payments
        recent_payments = [
            {
                "id": payment.id,
                "amount": float(payment.amount),
                "status": payment.status,
                "paid_on": payment.paid_on.isoformat()
            }
            for payment in recent_payments_qs
        ]
        
        prev_start_date, prev_end_date = DashboardService.get_previous_period(start_date, end_date)
        
        previous_revenue = Payment.objects.filter(
            status='COMPLETED',
            paid_on__gte=prev_start_date,
            paid_on__lte=prev_end_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        change = DashboardService.calculate_percentage_change(
            float(total_revenue), float(previous_revenue)
        )
        
        trend_days = 7
        trend_start = timezone.now().date() - timedelta(days=trend_days - 1)
        trend_dates = [(trend_start + timedelta(days=i)).strftime('%Y-%m-%d') 
                      for i in range(trend_days)]
        
        trend_data = {
            "chart_type": "bar",
            "title": "Revenue Trend",
            "labels": trend_dates,
            "datasets": [
                {
                    "label": "Revenue",
                    "data": [
                        float(Payment.objects.filter(
                            status='COMPLETED',
                            paid_on=trend_start + timedelta(days=i)
                        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00'))
                        for i in range(trend_days)
                    ],
                    "backgroundColor": "rgba(33, 150, 243, 0.7)"
                }
            ]
        }
        
        today = timezone.now().date()
        payment_summary = {
            'due_today': Payment.objects.filter(
                status='PENDING',
                due_date=today
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00'),
            'overdue': Payment.objects.filter(
                status='PENDING',
                due_date__lt=today
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00'),
            'upcoming': Payment.objects.filter(
                status='PENDING',
                due_date__gt=today
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        }
        
        return {
            "total_revenue": total_revenue,
            "revenue_by_status": revenue_by_status,
            "recent_payments": recent_payments,
            "revenue_trend": trend_data,
            "change": change,
            "trend": "up" if change and change > 0 else "down" if change and change < 0 else "flat",
            "comparison_label": f"vs. previous {(end_date - start_date).days + 1} days",
            "payment_summary": payment_summary
        }
    
    @staticmethod
    def get_clients_overview(start_date, end_date, user=None):
        """
        Get clients overview data for the dashboard
        """
        clients_query = User.objects.filter(role='CLIENT')
        
        total_clients = clients_query.count()
        
        active_clients = clients_query.filter(
            is_active=True,
            events__status__in=['LEAD', 'CONFIRMED']
        ).distinct().count()
        
        new_clients = clients_query.filter(
            date_joined__gte=start_date,
            date_joined__lte=end_date
        ).count()
        
        prev_start_date, prev_end_date = DashboardService.get_previous_period(start_date, end_date)
        
        previous_new_clients = clients_query.filter(
            date_joined__gte=prev_start_date,
            date_joined__lte=prev_end_date
        ).count()
        
        change = DashboardService.calculate_percentage_change(new_clients, previous_new_clients)
        
        trend_months = 6
        today = timezone.now().date()
        trend_start = today.replace(day=1) - timedelta(days=1)
        
        for _ in range(trend_months - 1):
            trend_start = trend_start.replace(day=1) - timedelta(days=1)
        trend_start = trend_start.replace(day=1)
        
        trend_months_labels = []
        trend_months_data = []
        
        current = trend_start
        while current <= today:
            month_label = current.strftime('%b %Y')
            month_end = (current.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
            
            if month_end > today:
                month_end = today
                
            month_clients = clients_query.filter(
                date_joined__gte=current,
                date_joined__lte=month_end
            ).count()
            
            trend_months_labels.append(month_label)
            trend_months_data.append(month_clients)
            
            current = month_end + timedelta(days=1)
        
        trend_data = {
            "chart_type": "line",
            "title": "New Clients Trend",
            "labels": trend_months_labels,
            "datasets": [
                {
                    "label": "New Clients",
                    "data": trend_months_data,
                    "borderColor": "#FF9800",
                    "backgroundColor": "rgba(255, 152, 0, 0.1)"
                }
            ]
        }
        
        recent_clients_qs = clients_query.order_by('-date_joined')[:5]
        
        # Serialize recent clients
        recent_clients = [
            {
                "id": client.id,
                "first_name": client.first_name,
                "last_name": client.last_name,
                "email": client.email,
                "date_joined": client.date_joined.isoformat()
            }
            for client in recent_clients_qs
        ]
        
        return {
            "total_clients": total_clients,
            "active_clients": active_clients,
            "new_clients": new_clients,
            "clients_trend": trend_data,
            "recent_clients": recent_clients,
            "change": change,
            "trend": "up" if change and change > 0 else "down" if change and change < 0 else "flat",
            "comparison_label": f"vs. previous {(end_date - start_date).days + 1} days"
        }
    
    @staticmethod
    def get_tasks_overview(start_date, end_date, user=None):
        """
        Get tasks overview data for the dashboard
        """
        tasks_query = EventTask.objects
        
        if user:
            tasks_query = tasks_query.filter(assigned_to=user)
            
        total_tasks = tasks_query.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).count()
        
        completed_tasks = tasks_query.filter(
            status='COMPLETED',
            completed_at__gte=start_date,
            completed_at__lte=end_date
        ).count()
        
        today = timezone.now().date()
        
        overdue_tasks = tasks_query.filter(
            status__in=['PENDING', 'IN_PROGRESS'],
            due_date__lt=today
        ).count()
        
        urgent_tasks = tasks_query.filter(
            status__in=['PENDING', 'IN_PROGRESS'],
            priority__in=['HIGH', 'URGENT'],
            due_date__lte=today + timedelta(days=2)
        ).count()
        
        tasks_by_status = {
            status: tasks_query.filter(status=status).count()
            for status in ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED']
        }
        
        upcoming_tasks_qs = tasks_query.filter(
            status__in=['PENDING', 'IN_PROGRESS'],
            due_date__gte=today,
            due_date__lte=today + timedelta(days=7)
        ).order_by('due_date', '-priority')[:10]
        
        # Serialize upcoming tasks
        upcoming_tasks = [
            {
                "id": task.id,
                "title": task.title,
                "status": task.status,
                "priority": task.priority,
                "due_date": task.due_date.isoformat(),
                "assigned_to_id": task.assigned_to_id
            }
            for task in upcoming_tasks_qs
        ]
        
        completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "overdue_tasks": overdue_tasks,
            "urgent_tasks": urgent_tasks,
            "tasks_by_status": tasks_by_status,
            "upcoming_tasks": upcoming_tasks,
            "completion_rate": round(completion_rate, 2)
        }
    
    @staticmethod
    def get_recent_activity(limit=10, user=None):
        """
        Get recent activity for the dashboard
        """
        timeline_query = EventTimeline.objects.select_related(
            'event', 'actor'
        ).order_by('-created_at')
        
        if user:
            timeline_query = timeline_query.filter(
                Q(actor=user) | Q(event__client=user)
            )
            
        timeline_entries = timeline_query[:limit]
        
        # This was already serializable, but ensuring consistency
        activities = [
            {
                "id": entry.id,
                "type": entry.action_type,
                "description": entry.description,
                "timestamp": entry.created_at.isoformat(),
                "event_id": entry.event.id if entry.event else None,
                "event_name": entry.event.name if entry.event else None,
                "actor_id": entry.actor.id if entry.actor else None,
                "actor_name": f"{entry.actor.first_name} {entry.actor.last_name}" if entry.actor else "System",
            }
            for entry in timeline_entries
        ]
            
        return activities
    
    @staticmethod
    def get_key_metrics(start_date, end_date, user=None):
        """
        Get key metrics for the dashboard
        """
        prev_start_date, prev_end_date = DashboardService.get_previous_period(start_date, end_date)
        
        metrics = []
        
        current_revenue = Payment.objects.filter(
            status='COMPLETED',
            paid_on__gte=start_date,
            paid_on__lte=end_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        previous_revenue = Payment.objects.filter(
            status='COMPLETED',
            paid_on__gte=prev_start_date,
            paid_on__lte=prev_end_date
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        
        revenue_change = DashboardService.calculate_percentage_change(
            float(current_revenue), float(previous_revenue)
        )
        
        metrics.append({
            "label": "Total Revenue",
            "value": float(current_revenue),
            "type": "money",
            "change": revenue_change,
            "trend": "up" if revenue_change and revenue_change > 0 else "down" if revenue_change and revenue_change < 0 else "flat",
            "comparison_label": "vs. previous period"
        })
        
        current_events = Event.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).count()
        
        previous_events = Event.objects.filter(
            created_at__gte=prev_start_date,
            created_at__lte=prev_end_date
        ).count()
        
        events_change = DashboardService.calculate_percentage_change(
            current_events, previous_events
        )
        
        metrics.append({
            "label": "New Events",
            "value": current_events,
            "type": "number",
            "change": events_change,
            "trend": "up" if events_change and events_change > 0 else "down" if events_change and events_change < 0 else "flat",
            "comparison_label": "vs. previous period"
        })
        
        current_clients = User.objects.filter(
            role='CLIENT',
            date_joined__gte=start_date,
            date_joined__lte=end_date
        ).count()
        
        previous_clients = User.objects.filter(
            role='CLIENT',
            date_joined__gte=prev_start_date,
            date_joined__lte=prev_end_date
        ).count()
        
        clients_change = DashboardService.calculate_percentage_change(
            current_clients, previous_clients
        )
        
        metrics.append({
            "label": "New Clients",
            "value": current_clients,
            "type": "number",
            "change": clients_change,
            "trend": "up" if clients_change and clients_change > 0 else "down" if clients_change and clients_change < 0 else "flat",
            "comparison_label": "vs. previous period"
        })
        
        total_tasks = EventTask.objects.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        ).count()
        
        completed_tasks = EventTask.objects.filter(
            status='COMPLETED',
            completed_at__gte=start_date,
            completed_at__lte=end_date
        ).count()
        
        current_completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        prev_total_tasks = EventTask.objects.filter(
            created_at__gte=prev_start_date,
            created_at__lte=prev_end_date
        ).count()
        
        prev_completed_tasks = EventTask.objects.filter(
            status='COMPLETED',
            completed_at__gte=prev_start_date,
            completed_at__lte=prev_end_date
        ).count()
        
        previous_completion_rate = (prev_completed_tasks / prev_total_tasks * 100) if prev_total_tasks > 0 else 0
        
        completion_change = DashboardService.calculate_percentage_change(
            current_completion_rate, previous_completion_rate
        )
        
        metrics.append({
            "label": "Task Completion Rate",
            "value": round(current_completion_rate, 2),
            "type": "percentage",
            "change": completion_change,
            "trend": "up" if completion_change and completion_change > 0 else "down" if completion_change and completion_change < 0 else "flat",
            "comparison_label": "vs. previous period"
        })
        
        return metrics
    
    @staticmethod
    def get_dashboard_data(time_range='week', user=None):
        """
        Get complete dashboard data
        """
        start_date, end_date = DashboardService.get_date_range(time_range)
        
        events_overview = DashboardService.get_events_overview(start_date, end_date, user)
        revenue_overview = DashboardService.get_revenue_overview(start_date, end_date, user)
        clients_overview = DashboardService.get_clients_overview(start_date, end_date, user)
        tasks_overview = DashboardService.get_tasks_overview(start_date, end_date, user)
        key_metrics = DashboardService.get_key_metrics(start_date, end_date, user)
        recent_activity = DashboardService.get_recent_activity(10, user)
        
        return {
            "time_range": time_range,
            "date_range": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat()
            },
            "events_overview": events_overview,
            "revenue_overview": revenue_overview,
            "clients_overview": clients_overview,
            "tasks_overview": tasks_overview,
            "key_metrics": key_metrics,
            "recent_activity": recent_activity
        }

    @staticmethod
    def get_user_preference(user_id):
        """
        Get dashboard preference for a user
        """
        try:
            return DashboardPreference.objects.get(user_id=user_id)
        except DashboardPreference.DoesNotExist:
            return DashboardPreference.objects.create(
                user_id=user_id,
                layout=DashboardPreference.get_default_layout()
            )
    
    @staticmethod
    def update_user_preference(user_id, preference_data):
        """
        Update dashboard preference for a user
        """
        try:
            preference = DashboardPreference.objects.get(user_id=user_id)
        except DashboardPreference.DoesNotExist:
            preference = DashboardPreference(
                user_id=user_id,
                layout=DashboardPreference.get_default_layout()
            )
        
        if 'layout' in preference_data:
            preference.layout = preference_data['layout']
        
        if 'default_time_range' in preference_data:
            preference.default_time_range = preference_data['default_time_range']
            
        preference.save()
        return preference
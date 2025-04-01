# backend/core/domains/dashboard/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DashboardPreferenceViewSet, DashboardViewSet

# Create a router for viewsets
router = DefaultRouter()
router.register(r'dashboard', DashboardViewSet, basename='dashboard')
router.register(r'preferences', DashboardPreferenceViewSet, basename='dashboard-preferences')

# URL patterns for the dashboard domain
urlpatterns = [
    path('', include(router.urls)),
]
# backend/core/domains/events/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'events'

router = DefaultRouter()
router.register(r'event-types', views.EventTypeViewSet, basename='eventtype')

urlpatterns = [
    path('', include(router.urls)),
]
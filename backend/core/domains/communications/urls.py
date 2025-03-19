# backend/core/domains/communications/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'communications'

router = DefaultRouter()
router.register(r'email-templates', views.EmailTemplateViewSet)
router.register(r'email-records', views.EmailRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
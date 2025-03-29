# backend/core/domains/contracts/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'contracts'

router = DefaultRouter()
router.register(r'templates', views.ContractTemplateViewSet, basename='template')
router.register(r'contracts', views.EventContractViewSet, basename='contract')

urlpatterns = [
    path('', include(router.urls)),
]
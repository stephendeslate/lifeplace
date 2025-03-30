# backend/core/domains/bookingflow/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BookingFlowViewSet,
    BookingStepViewSet,
    EventTypeViewSet,
    ProductStepItemViewSet,
)

router = DefaultRouter()
router.register(r'flows', BookingFlowViewSet, basename='booking-flows')
router.register(r'steps', BookingStepViewSet, basename='booking-steps')
router.register(r'product-items', ProductStepItemViewSet, basename='product-items')
router.register(r'event-types', EventTypeViewSet, basename='event-types')

urlpatterns = [
    path('', include(router.urls)),
]
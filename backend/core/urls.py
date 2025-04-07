# backend/core/urls.py
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.generic.base import RedirectView
from django.views.static import serve as static_serve

# API URLs - these are the same as before
api_urlpatterns = [
    path('users/', include('core.domains.users.urls')),
    path('clients/', include('core.domains.clients.urls')),
    path('communications/', include('core.domains.communications.urls')),
    path('products/', include('core.domains.products.urls')),
    path('events/', include('core.domains.events.urls')),
    path('workflows/', include('core.domains.workflows.urls')),
    path('questionnaires/', include('core.domains.questionnaires.urls')),
    path('notes/', include('core.domains.notes.urls')),
    path('contracts/', include('core.domains.contracts.urls')),
    path('sales/', include('core.domains.sales.urls')),
    path('payments/', include('core.domains.payments.urls')),
    path('notifications/', include('core.domains.notifications.urls')),
    path('bookingflow/', include('core.domains.bookingflow.urls')),
    path('dashboard/', include('core.domains.dashboard.urls')),
]

# Create a view function to serve the admin-crm frontend
def serve_admin_crm(request, path=''):
    """
    Serve the React admin-crm frontend app.
    If the requested file exists in static files, serve it.
    Otherwise, return index.html for React to handle routing.
    """
    import os

    from django.conf import settings

    static_path = os.path.join(settings.STATIC_ROOT, 'admin-crm', path)

    if os.path.exists(static_path) and not path.endswith('/'):
        return static_serve(request, path, document_root=os.path.join(settings.STATIC_ROOT, 'admin-crm'))
    return TemplateView.as_view(template_name="admin-crm/index.html")(request)

urlpatterns = [
    path("", RedirectView.as_view(url="/dashboard/", permanent=True)),
    # Django admin interface
    path('django-admin/', admin.site.urls),
    
    # API endpoints - mounted at /api
    path('api/', include(api_urlpatterns)),
    
    # Admin CRM SPA - Catch all routes and let React router handle them
    re_path(r'^(?P<path>.*)$', serve_admin_crm),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
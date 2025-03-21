from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('core.domains.users.urls')),
    path('api/communications/', include('core.domains.communications.urls')),
    path('api/products/', include('core.domains.products.urls')),
    path('api/events/', include('core.domains.events.urls')),
    # Add more domain URLs here
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
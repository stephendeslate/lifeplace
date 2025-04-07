"""
Django settings for the LifePlace project.
"""

import os
from datetime import timedelta
from pathlib import Path

import certifi
import dj_database_url
import environ

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Set up environment variables
env = environ.Env(
    DEBUG=(bool, False),  # Default to False for production
    SECRET_KEY=(str, 'django-insecure-key-please-change-in-production'),
    ENVIRONMENT=(str, 'production'),  # Default to production
    ADMIN_DOMAIN=(str, 'lifeplace.fly.dev'),  # Default domain for admin
    CLIENT_DOMAIN=(str, 'client.lifeplace.fly.dev'), # Default domain for client
    ALLOWED_HOSTS=(list, ['localhost', '127.0.0.1', '.fly.dev']),  # Default allowed hosts
    CSRF_TRUSTED_ORIGINS=(list, ['https://lifeplace.fly.dev']),  # Default CSRF trusted origins
    DB_NAME=(str, 'lifeplace'),
    DB_USER=(str, 'postgres'),
    DB_PWD=(str, 'postgres'),
    DB_HOST=(str, 'localhost'),
    DB_PORT=(str, '5432'),
    DATABASE_URL=(str, ''),  # For Fly.io database
    EMAIL_HOST_USER=(str, ''),
    EMAIL_HOST_PASSWORD=(str, ''),
    REDIS_URL=(str, 'redis://localhost:6379/0'),
    CELERY_BROKER_URL=(str, 'redis://localhost:6379/0'),
)

# Take environment variables from .env file if it exists
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

ENVIRONMENT = env('ENVIRONMENT')

# Admin domain setting
ADMIN_DOMAIN = env('ADMIN_DOMAIN')

# Client domain setting
CLIENT_DOMAIN = env('CLIENT_DOMAIN')

# Allowed hosts and CSRF trusted origins
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS')

# Application definition
INSTALLED_APPS = [
    # Project apps - domains (must come before admin for custom user model)
    'core.domains.users.apps.UsersConfig',  # Users domain
    'core.domains.communications.apps.CommunicationsConfig',  # Communications domain
    'core.domains.events.apps.EventsConfig', # Events domain
    'core.domains.clients.apps.ClientsConfig',  # Clients domain
    'core.domains.products.apps.ProductsConfig', # Products domain
    'core.domains.workflows.apps.WorkflowsConfig',  # Workflows domain
    'core.domains.questionnaires.apps.QuestionnairesConfig',  # Questionnaires domain
    'core.domains.notes.apps.NotesConfig', # Notes domain
    'core.domains.contracts.apps.ContractsConfig', # Contracts domain
    'core.domains.sales.apps.SalesConfig', # Sales domain
    'core.domains.payments.apps.PaymentsConfig', # Payments domain
    'core.domains.notifications.apps.NotificationsConfig', # Notifications domain
    'core.domains.bookingflow.apps.BookingFlowConfig', # Booking flow domain
    'core.domains.dashboard.apps.DashboardConfig', # Dashboard domain
    
    # Django built-in apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'whitenoise.runserver_nostatic',  # Add WhiteNoise for development server
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # WhiteNoise middleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'core.middleware.DomainRoutingMiddleware',  # Our custom domain middleware
]

# CORS settings based on environment
if ENVIRONMENT == 'production':
    # Production settings
    CORS_ALLOWED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS')  # Use the same list as CSRF_TRUSTED_ORIGINS
    CORS_ALLOW_CREDENTIALS = True
    CORS_ALLOW_METHODS = [
        'DELETE',
        'GET',
        'OPTIONS',
        'PATCH',
        'POST',
        'PUT',
    ]
    CORS_ALLOW_HEADERS = [
        'accept',
        'accept-encoding',
        'authorization',
        'content-type',
        'dnt',
        'origin',
        'user-agent',
        'x-csrftoken',
        'x-requested-with',
    ]
else:
    # Development settings
    CORS_ALLOW_ALL_ORIGINS = True
    CORS_ALLOW_CREDENTIALS = True

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'static')],  # Add the static directory to find templates
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Database configuration
# Check for DATABASE_URL environment variable (used by Fly.io)
if env('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=env('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Fall back to manual configuration
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("DB_NAME"),
            "USER": env("DB_USER"),
            "PASSWORD": env("DB_PWD"),
            "HOST": env("DB_HOST"),
            "PORT": env("DB_PORT"),
            "TEST": {
                "NAME": "test_" + env.str("DB_NAME", default="default"),
                "SERIALIZE": False,
            },
        }
    }

# Custom User model
AUTH_USER_MODEL = 'users.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,  # Default page size
}

# JWT settings
SIMPLE_JWT = {
    "AUTH_HEADER_TYPES": ('Bearer',),
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),

    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': False,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,

    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',

    'JTI_CLAIM': 'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# Email settings
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend' if DEBUG else 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 465
EMAIL_USE_SSL = True
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
EMAIL_SSL_CERTFILE = certifi.where()  # Use certifi's certificate store

# Frontend URLs for invitation links - update for production
ADMIN_FRONTEND_URL = f"https://{ADMIN_DOMAIN}" if ENVIRONMENT == 'production' else env('ADMIN_FRONTEND_URL')
CLIENT_FRONTEND_URL = f"https://{CLIENT_DOMAIN}" if ENVIRONMENT == 'production' else env('CLIENT_FRONTEND_URL')

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Enable WhiteNoise's GZip compression
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Celery settings
CELERY_BROKER_URL = env('CELERY_BROKER_URL')
CELERY_RESULT_BACKEND = env('REDIS_URL')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Production security settings
if ENVIRONMENT == 'production':
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    # SECURE_SSL_REDIRECT = True  # Commented out - Fly.io handles HTTPS redirects
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    X_FRAME_OPTIONS = 'DENY'
    
    # Properly handle proxy headers
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    USE_X_FORWARDED_HOST = True
    USE_X_FORWARDED_PORT = True
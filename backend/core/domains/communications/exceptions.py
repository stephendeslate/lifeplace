# backend/core/domains/communications/exceptions.py
from rest_framework import status
from rest_framework.exceptions import APIException


class TemplateNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Email template not found."
    default_code = "template_not_found"


class TemplateNameExists(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "An email template with this name already exists."
    default_code = "template_name_exists"


class InvalidTemplateFormat(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "The template format is invalid."
    default_code = "invalid_template_format"
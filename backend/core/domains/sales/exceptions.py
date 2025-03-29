# backend/core/domains/sales/exceptions.py
from rest_framework import status
from rest_framework.exceptions import APIException


class QuoteTemplateNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Quote template not found."


class EventNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Event not found."


class QuoteNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Quote not found."


class LineItemNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Line item not found."


class InvalidQuoteStatusTransition(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid quote status transition."


class TemplateProductAlreadyExists(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "This product is already in the template."
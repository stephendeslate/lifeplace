# backend/core/domains/notifications/exceptions.py
from rest_framework import status
from rest_framework.exceptions import APIException


class NotificationNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Notification not found."


class NotificationTypeNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Notification type not found."


class NotificationTemplateNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Notification template not found."


class NotificationPreferenceNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Notification preference not found."


class InvalidNotificationDataException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid notification data provided."


class CannotEditReadNotificationException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Cannot modify a notification that has been read."


class InvalidBulkActionException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid bulk action request."
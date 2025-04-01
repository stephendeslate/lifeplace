# backend/core/domains/dashboard/exceptions.py
from rest_framework.exceptions import APIException


class DashboardDataError(APIException):
    """Exception raised when dashboard data cannot be retrieved"""
    status_code = 500
    default_detail = "Failed to retrieve dashboard data"
    default_code = "dashboard_data_error"


class DateRangeInvalid(APIException):
    """Exception raised when date range is invalid"""
    status_code = 400
    default_detail = "Invalid date range provided"
    default_code = "date_range_invalid"


class DashboardPreferenceNotFound(APIException):
    """Exception raised when dashboard preference is not found"""
    status_code = 404
    default_detail = "Dashboard preference not found"
    default_code = "dashboard_preference_not_found"


class InvalidDashboardWidget(APIException):
    """Exception raised when an invalid dashboard widget is requested"""
    status_code = 400
    default_detail = "Invalid dashboard widget type"
    default_code = "invalid_dashboard_widget"
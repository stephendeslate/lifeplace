# backend/core/domains/products/exceptions.py
from rest_framework import status
from rest_framework.exceptions import APIException


class ProductNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Product not found."
    default_code = "product_not_found"


class DiscountNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Discount not found."
    default_code = "discount_not_found"


class DiscountCodeExists(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "A discount with this code already exists."
    default_code = "discount_code_exists"


class InvalidDiscountValue(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid discount value."
    default_code = "invalid_discount_value"


class InvalidDateRange(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid date range. Valid until must be after valid from."
    default_code = "invalid_date_range"
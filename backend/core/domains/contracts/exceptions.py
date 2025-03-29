# backend/core/domains/contracts/exceptions.py
from rest_framework import status
from rest_framework.exceptions import APIException


class ContractTemplateNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Contract template not found."
    default_code = "contract_template_not_found"


class EventContractNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Event contract not found."
    default_code = "event_contract_not_found"


class InvalidContractStatus(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid contract status transition."
    default_code = "invalid_contract_status"


class ContractAlreadySigned(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Contract has already been signed."
    default_code = "contract_already_signed"


class EventNotFound(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Event not found."
    default_code = "event_not_found"


class InvalidContractTemplate(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid contract template format."
    default_code = "invalid_contract_template"


class SignatureRequired(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Signature is required to sign this contract."
    default_code = "signature_required"


class ContractExpired(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Contract has expired and cannot be signed."
    default_code = "contract_expired"
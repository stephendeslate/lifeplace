# Products API Documentation

This document provides information about the Products domain APIs for the LifePlace application.

## Overview

The Products domain manages two primary entities:

1. **Product Options** - Products and packages that can be offered to clients
2. **Discounts** - Special offers and promotional codes that can be applied to products

## Authentication

All API endpoints require authentication using JWT tokens. Admin role is required for all endpoints.

## Base URL

All endpoints are prefixed with: `/api/products/`

## Product Options API

### List All Products

```
GET /products/
```

**Query Parameters:**

- `search`: Search term for filtering by name or description
- `type`: Filter by product type (`PRODUCT` or `PACKAGE`)
- `is_active`: Filter by active status (`true` or `false`)
- `page`: Page number for pagination

**Response:**

```json
{
  "count": 10,
  "next": "http://example.com/api/products/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Sample Package",
      "description": "A sample package",
      "base_price": "500.00",
      "currency": "PHP",
      "tax_rate": "12.00",
      "event_type": null,
      "type": "PACKAGE",
      "type_display": "Package",
      "is_active": true,
      "allow_multiple": false,
      "has_excess_hours": true,
      "included_hours": 10,
      "excess_hour_price": "50.00",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    },
    ...
  ]
}
```

### Get Products Only

```
GET /products/products/
```

Returns only items of type `PRODUCT`, with the same response format as the list endpoint.

### Get Packages Only

```
GET /products/packages/
```

Returns only items of type `PACKAGE`, with the same response format as the list endpoint.

### Get Active Products

```
GET /products/active/
```

Returns only active products and packages, with the same response format as the list endpoint.

### Get Single Product

```
GET /products/{id}/
```

Returns details for a specific product or package.

### Create Product

```
POST /products/
```

**Request Body:**

```json
{
  "name": "New Product",
  "description": "A new product description",
  "base_price": "100.00",
  "currency": "PHP",
  "tax_rate": "12.00",
  "event_type": null,
  "type": "PRODUCT",
  "is_active": true,
  "allow_multiple": false,
  "has_excess_hours": false
}
```

**Additional fields for products with excess hours:**

```json
{
  "has_excess_hours": true,
  "included_hours": 5,
  "excess_hour_price": "50.00"
}
```

### Update Product

```
PUT /products/{id}/
```

Use the same request body format as the create endpoint. All fields are required.

For partial updates, use:

```
PATCH /products/{id}/
```

Include only the fields you want to update.

### Delete Product

```
DELETE /products/{id}/
```

## Discounts API

### List All Discounts

```
GET /discounts/
```

**Query Parameters:**

- `search`: Search term for filtering by code or description
- `is_active`: Filter by active status (`true` or `false`)
- `is_valid`: Filter by current validity (`true` or `false`)
- `page`: Page number for pagination

**Response:**

```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "code": "SUMMER20",
      "description": "Summer sale 20% off",
      "discount_type": "PERCENTAGE",
      "discount_type_display": "Percentage",
      "value": "20.00",
      "is_active": true,
      "valid_from": "2023-06-01",
      "valid_until": "2023-08-31",
      "max_uses": 1000,
      "current_uses": 150,
      "is_valid_now": true,
      "applicable_products": [1, 2, 3],
      "applicable_products_count": 3,
      "created_at": "2023-05-15T00:00:00Z",
      "updated_at": "2023-05-15T00:00:00Z"
    },
    ...
  ]
}
```

### Get Valid Discounts

```
GET /discounts/valid/
```

Returns only currently valid discounts, with the same response format as the list endpoint.

### Get Single Discount

```
GET /discounts/{id}/
```

Returns details for a specific discount, including full information about applicable products.

### Create Discount

```
POST /discounts/
```

**Request Body:**

```json
{
  "code": "WELCOME10",
  "description": "Welcome discount 10% off",
  "discount_type": "PERCENTAGE",
  "value": "10.00",
  "is_active": true,
  "valid_from": "2023-01-01",
  "valid_until": "2023-12-31",
  "max_uses": 500,
  "applicable_products": [1, 2]
}
```

Notes:

- `valid_until` is optional (leave empty for no expiration)
- `max_uses` is optional (leave empty for unlimited uses)
- `applicable_products` is optional (leave empty to apply to all products)

### Update Discount

```
PUT /discounts/{id}/
```

Use the same request body format as the create endpoint. All fields are required.

For partial updates, use:

```
PATCH /discounts/{id}/
```

Include only the fields you want to update.

### Delete Discount

```
DELETE /discounts/{id}/
```

### Increment Discount Usage

```
POST /discounts/{id}/increment_usage/
```

Increments the usage count for a discount. This should be called when a discount is applied to an order.

## Error Responses

The API returns standard HTTP status codes and error messages in the following format:

```json
{
  "detail": "Error message here"
}
```

Common errors:

- `404 Not Found`: Product or discount not found
- `400 Bad Request`: Validation errors in request data
- `403 Forbidden`: User does not have permission to access the endpoint
- `401 Unauthorized`: Authentication required

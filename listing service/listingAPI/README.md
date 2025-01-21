# Listing Service

## Overview

The ahia Listing Service API is a robust backend service designed to manage real estate listings on the ahia marketplace. It provides endpoints for creating, retrieving, updating, and deleting listings and associated products, as well as specialized endpoints for carrying out various operations on listing and products. This API ensures idempotency and supports features like pagination, filtering, sorting, projection and geospatial queries out of the box.
Authorization and authentication is enabled by an identity server which manages user account and permissions.

## Table of Contents

- [Features](#features)

- [Installation](#installation)

- [Configuration](#configuration)

- [Usage](#usage)

- [Endpoints](#endpoints)

- [Contributing](#contributing)

- [License](#license)

## Features

- **CRUD Operations**: Create, retrieve, update, and delete listings.

- **Idempotency**: Ensures idempotent operations for create and update requests.

- **Transactions**: Uses database transactions to maintain data accuracy and integrity.

- **Geospatial Queries**: Supports 2dsphere indexing for location-based queries.

- **Pagination**: Provides pagination for collection operations.

- **CRUD Endpoints**: Read, Create, Update and Delete.

- **Specialized Endpoints**: Fetch customizable listing and product information based on pre-defined and/or aliased endpoints.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Dev-Clair/ahia/tree/listing_service/\'listing service\'/listingAPI.git

   cd listingAPI/
   ```

## Endpoints

1.  Listing CRUD Endpoints

    1.1 Create a Listing

    ```
    POST /api/v1/listings
    ```

    1.2 Retrieve Listings by Provider

    ```
    GET /api/v1/listings/provider/:id
    ```

    1.3 Retrieves Listings by Type

    ```
    GET /api/v1/listings/type/:type
    ```

    1.4 Retrieve a Listing by Search

    ```
    GET /api/v1/listings/search/q?
    ```

    1.5 Retrieve a Listing by ID

    ```
    GET /api/v1/listings/:id
    ```

    1.6 Update a Listing by ID

    ```
    PATCH /api/v1/listings/:id
    ```

    1.7 Delete a Listing by ID

    ```
    DELETE /api/v1/listings/:id
    ```

2.  Specialized Listing CRUD Endpoints

    2.1 Retrieve a Listing by ID with Populated Products Details

    ```
    GET /api/v1/listings/:id/product
    ```

    2.2 Retrieve a Listing's Products

    ```
    GET /api/v1/listings/:id/products
    ```

    2.3 Create Product(s) on a Listing

    ```
    POST /api/v1/listings/:id/products
    ```

    2.4 Update a Listing's Product by ID

    ```
    PATCH /api/v1/listings/:id/products/:productId
    ```

    2.5 Delete a Listing's Product by ID

    ```
    DELETE /api/v1/listings/:id/products/:productId
    ```

3.  Product Endpoints (Geospatial queries: requires geo-coordinates (lat, lng) as query parameters)

    3.1 Retrieve All Products Types

    ```
    GET /api/v1/listings/products/
    ```

    3.2 Retrieve Products by Location

    ```
    GET /api/v1/listings/products/status/:status/location/:city/:state
    ```

    3.3 Retrieve Products Nearby

    ```
    GET /api/v1/listings/products/status/:status/nearby
    ```

    3.4 Retrieve Products by Offerings

    ```
    GET /api/v1/listings/products/status/:status/offerings
    ```

    3.5 Retrieves Products by Search

    ```
    GET /api/v1/listings/products/status/:status/search/q?
    ```

    3.6 Retrieves Products by Place

    ```
    GET /api/v1/listings/products/status/:status/place/:place
    ```

    3.7 Retrieves Products by Listing Provider

    ```
    GET /api/v1/listings/products/status/:status/provider/:id
    ```

    3.8 Retrieves Products by Listing Type

    ```
    GET /api/v1/listings/products/status/:status/type/:type
    ```

    3.9 Retrieves a Product by ID

    ```
    GET /api/v1/listings/products/:id
    ```

    3.10 Retrieves a Product by ID with Populated Listing Details

    ```
    GET /api/v1/listings/products/:id/listing
    ```

## Error Handling

Errors are handled by an in-app custom error middleware and sentry express error handler.

        |            Type       |               Handler                 |
        |---------------------- | --------------------------------------|
        |   Operational         |   Custom Error Handling Middleware    |
        |   Non-Operational     |   Custom Error Handling Middleware    |
        |   UnCaught Exception  |               Sentry                  |
        |   Unhandled Rejection |               Sentry                  |
        |   General App Error   |               Sentry                  |

## Contributing

This project is closed source. Therefore, contributions are not welcomed! Thanks.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

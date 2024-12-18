# Listing Service

## Overview

The ahia Listing Service API is a robust backend service designed to manage real estate listings on the ahia marketplace. It provides endpoints for creating, retrieving, updating, and deleting listings and associated products, as well as specialized endpoints for carrying out various operations on listing and products. This API ensures idempotency, handles listing approval and payment checkout, and supports features like pagination and geospatial queries.
This API ensures idempotency, uses transactions, and supports features like pagination and geospatial queries.
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

1.  Listing Endpoints

    1.1 Create a Listing

    ```
    POST /api/v1/listings
    ```

    1.2 Retrieve All Listings

    ```
    GET /api/v1/listings
    ```

    1.3 Retrieves Listings based on search

    ```
    GET /api/v1/listings/search
    ```

    1.4 Retrieve a Listing by Slug

    ```
    GET /api/v1/listings/:slug
    ```

    1.5 Retrieve a Listing by ID

    ```
    GET /api/v1/listings/:id
    ```

    1.6 Update a Listing by ID

    ```
    PATCH /api/v1/listings/:id
    ```

    1.7 Deletes a Listing by ID

    ```
    DELETE /api/v1/listings/:id
    ```

2.  Specialized Listing Endpoints

    2.1 Listings Near Me

    ```
    GET /api/v1/listings/near-me
    ```

    2.2 Retrieve Listings by Provider

    ```
    GET /api/v1/listings/provider/:providerId
    ```

    2.3 Retrieve Listings By Type: Properties | Lands

    ```
    GET /api/v1/listings/type/:type
    ```

    2.4 Retrieve a Listing's Products

    ```
    GET /api/v1/listings/:id/products/:type
    ```

    2.5 Create a new Product for a Listing

    ```
    POST /api/v1/listings/:id/products/:type
    ```

    2.6 Retrieve a Listing By Id / Slug And Populate

    ```
    GET /api/v1/listings/:id|:slug/product/:type
    ```

    2.7 Retrieve a Listing's Product By Id | Slug

    ```
    GET /api/v1/listings/:id/product/:type/:productId|:productSlug
    ```

    2.8 Update a Listing's Product By Id

    ```
    PATCH /api/v1/listings/:id/products/:type/:ProductId
    ```

    2.9 Delete a Listing's Product By Id

    ```
    DELETE /api/v1/listings/:id/products/:type/:ProductId
    ```

3.  Specialized Product Endpoints

    3.1 Retrieve All Products

    ```
    GET /api/v1/products
    ```

    3.2 Retrieve Products By Category

    ```
    GET /api/v1/products/category
    ```

    3.3 Retrieve Products By Space

    ```
    GET /api/v1/products/space
    ```

    3.4 Retrieve Products By Status

    ```
    GET /api/v1/products/status
    ```

    3.5 Retrieves Products based on search

    ```
    GET /api/v1/products/search
    ```

    3.6 Retrieves Product by Id / Slug

    ```
    GET /api/v1/products/:id|:slug
    ```

    3.7 Retrieves Products by Id / Slug and Populate

    ```
    GET /api/v1/products/:id|:slug/listing
    ```

    3.8 Retrieves Listings based Products search

    ```
    GET /api/v1/products/search
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

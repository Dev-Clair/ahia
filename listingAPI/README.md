# Listing Service

## Overview

The ahia Listing Service API is a robust backend service designed to manage real estate listings on the ahia marketplace. It provides endpoints for creating, retrieving, updating, and deleting listings, as well as specialized endpoints for fetching top listings, exclusive listings, hot sales and leases. This API ensures idempotency, handles listing approval and payment checkout, and supports features like pagination and geospatial queries.
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

- **Pagination**: Provides pagination for listing collections.

- **CRUD Endpoints**: Read, Create, Update and Delete.

- **Specialized Endpoints**: Fetch customizable listing info based on pre-defined endpoints.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Dev-Clair/ahia/tree/listing_service/listingAPI.git

   cd listingAPI/
   ```

## Endpoints

1.  CRUD Endpoints

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

    1.4 Retrieve a Listing by ID

    ```
    GET /api/v1/listings/:id
    ```

    1.5 Update a Listing by ID

    ```
    PATCH /api/v1/listings/:id
    ```

    1.6 Deletes a Listing by ID

    ```
    DELETE /api/v1/listings/:id
    ```

2.  Specialized Endpoints

    2.1 Listings Near Me

    ```
    GET /api/v1/listings/near-me
    ```

    2.2 Listings by Provider

    ```
    GET /api/v1/listings/provider/:providerId
    ```

    2.3 Listings By Type

    ```
    GET /api/v1/listings/type/:type
    ```

    2.4 Listings By Category

    ```
    GET /api/v1/listings/category/:category
    ```

    2.5 Listing To Payment Checkout

    ```
    GET /api/v1/listings/:id/checkout
    ```

    2.6 Approves a Listing's Payment Status

    ```
    GET /api/v1/listings/:id/status/approve
    ```

    2.7 Verifies a Listing's Approval Status

    ```
    PATCH /api/v1/listings/:id/status/verify
    ```

## Error Handling

Errors are handled by an in-app custom error middleware and sentry express error handler.

        |   Type    |   Handler |
        |   --------------- | ----------------------------------  |
        |   Operational |   Custom Error Handling Middleware    |
        |   Non-Operational |   Custom Error Handling Middleware  |
        |   UnCaught Exception  |   Sentry  |
        |   Unhandled Rejection |   Sentry  |

## Contributing

Contributions are welcome! Please follow these steps:

```
    Fork the repository.

    Create a new branch: git checkout -b feature-branch.

    Make your changes and commit them: git commit -m 'Add new feature'.

    Push to the branch: git push origin feature-branch.

    Open a pull request.
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.

# Listing Service

## Overview

The ahia Listing Service API is a robust backend service designed to manage real estate listings. It provides endpoints for creating, retrieving, updating, and deleting listings, as well as specialized endpoints for fetching top listings, exclusive listings, hot sales and leases. This API ensures idempotency, handles listing approval and payment checkout, and supports features like pagination and geospatial queries.

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

- **Geospatial Queries**: Supports 2dsphere indexing for location-based queries.

- **Listing Approval**: Handles listing approval and payment validation.

- **Pagination**: Provides pagination for listing collections.

- **CRUD Endpoints**: Read, Create, Update and Delete.

- **Specialized Endpoints**: Fetch top listings, exclusive listings, and hot sales/leases.

- **Email Notifications**: Sends email notifications to providers upon listing creation.

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

    1.3 Retrieve a Listing by ID

    ```
    GET /api/v1/listings/:id
    ```

    1.4 Update a Listing by ID

    ```
    PATCH /api/v1/listings/:id
    ```

    1.5 Deletes a Listing by ID

    ```
    DELETE /api/v1/listings/:id
    ```

    1.6 Checkout a Listing

    ```
    GET /api/v1/listings/:id/checkout
    ```

    1.6 Validate a Listing Payment Status

    ```
    GET /api/v1/listings/:id/status
    ```

2.  Specialized Endpoints

    2.1 Top Listings by Provider

    ```
    GET /api/v1/listings/top-5?provider=:provider
    ```

    2.2 Exclusive Listings

    ```
    GET /api/v1/listings/exclusive?location=:location&category=:category
    ```

    2.3 Hot Sales Listings

    ```
    GET /api/v1/listings/hot-sale?location=:location
    ```

    2.4 Hot Lease Listings

    ```
    GET /api/v1/listings/hot-lease?location=:location
    ```

## Error Handling

Custom errors are handled by middleware. If an error occurs, it returns a structured JSON response with the error message and status code.

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

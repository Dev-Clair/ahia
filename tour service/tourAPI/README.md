# Tour Service

## Overview

The ahia Tour Service API is a robust backend service designed to manage real estate tour bookings and realtor appointments on the ahia marketplace platform. As a standalone service, it facilitates tours on listings with lease or sell type product offerings. It provides endpoints for creating, retrieving, updating, and deleting tours. The tour API ensures idempotency, uses transactions, and supports features like filtering, sorting, field selection and pagination.
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

- **CRUD Operations**: Create, retrieve, update, and delete tours.

- **Idempotency**: Ensures idempotent operations for create and update requests.

- **Transactions**: Uses database transactions to ensure operations are ACID.

- **Pagination**: Provides pagination for collection operations.

- **CRUD Endpoints**: Read, Create, Update and Delete.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Dev-Clair/ahia/tree/tour_service/tourAPI.git

   cd tourAPI/
   ```

## Endpoints

1.  CRUD Endpoints

    1.1 Create a Tour

    ```
    POST /api/v1/tours
    ```

    1.2 Retrieve All Tours

    ```
    GET /api/v1/tours
    ```

    1.3 Retrieve Tours Search

    ```
    GET /api/v1/tours/search
    ```

    1.4 Retrieve a Tour by ID

    ```
    GET /api/v1/tours/:id
    ```

    1.5 Update a Tour by ID

    ```
    PATCH /api/v1/tours/:id
    ```

    1.6 Deletes a Tour by ID

    ```
    DELETE /api/v1/tours/:id
    ```

2.  Specialized Endpoints

    2.1 Select all tour bookings for a customer

    ```
    GET /api/v1/tours/customer/:id
    ```

    2.2 Select all tour assignments for a realtor

    ```
    GET /api/v1/tours/realtor/:id
    ```

    2.7 Add a realtor to a tour

    ```
    POST /api/v1/tours/:id/realtors
    ```

    2.8 Accept tour realtor request

    ```
    PUT /api/v1/tours/:id/realtor/accept
    ```

    2.9 Reject tour realtor request

    ```
    PUT /api/v1/tours/:id/realtor/reject
    ```

    2.9 Remove realtor from a tour

    ```
    PUT /api/v1/tours/:id/realtor/remove
    ```

    2.11 Reschedule tour date and time

    ```
    POST /api/v1/tours/:id/schedule
    ```

    2.12 Accept proposed tour reschedule

    ```
    PUT /api/v1/tours/:id/schedule/accept
    ```

    2.13 Reject proposed tour reschedule

    ```
    PUT /api/v1/tours/:id/schedule/reject
    ```

## Error Handling

Errors are handled by an in-app custom error middleware and sentry express error handler.

        |            Type       |               Handler                 |
        |---------------------- | --------------------------------------|
        |   Operational         |   Custom Error Handling Middleware    |
        |   Non-Operational     |   Custom Error Handling Middleware    |
        |   UnCaught Exception  |           Sentry                      |
        |   Unhandled Rejection |           Sentry                      |
        |   General App Error   |           Sentry                      |

## Contributing

This is a closed source project. Therefore contributions are not welcome. Thanks

## License

This project is licensed under the MIT License. See the LICENSE file for details.

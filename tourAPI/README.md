# Listing Service

## Overview

The ahia Tour Service API is a robust backend service designed to manage real estate tour bookings and appointments on the ahia marketplace platform. It provides endpoints for creating, retrieving, updating, and deleting tours, as well as specialized endpoints for booking realtors and rescheduling tours.
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

- **CRUD Operations**: Create, retrieve, update, and delete tours.

- **Idempotency**: Ensures idempotent operations for create and update requests.

- **Transactions**: Uses database transactions to ensure operations are ACID.

- **Geospatial Queries**: Supports 2dsphere indexing for location-based queries.

- **Pagination**: Provides pagination for listing collections.

- **CRUD Endpoints**: Read, Create, Update and Delete.

- **Specialized Endpoints**: Complete, cancel and reopen tours, search and select realtors, schedule, reschedule, accept and reject tour appointments.

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
    POST /api/v1/tourss
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
    GET /api/v1/tours/customer?customerId=:customerId
    ```

    2.2 Select all tour assignments for a realtor

    ```
    GET /api/v1/tours/realtor?realtorId=:realtorId
    ```

    2.3 Mark a Tour as complete

    ```
    PATCH /api/v1/tours/:id/status/complete
    ```

    2.4 Mark a Tour as cancelled

    ```
    PATCH /api/v1/tours/:id/status/cancel
    ```

    2.5 Mark a Tour as reopened

    ```
    PATCH /api/v1/tours/:id/status/reopen
    ```

    2.6 Search available realtors based on tour location

    ```
    GET /api/v1/tours/:id/realtors
    ```

    2.7 Select/Request a realtor

    ```
    POST /api/v1/tours/:id/realtors
    ```

    2.8 Accept realtor request

    ```
    PUT /api/v1/tours/:id/realtors/accept
    ```

    2.9 Reject realtor request

    ```
    PUT /api/v1/tours/:id/realtors/reject
    ```

    2.10 Schedule tour date and time

    ```
    PUT /api/v1/tours/:id/schedule
    ```

    2.11 Reschedule tour date and time

    ```
    POST /api/v1/tours/:id/reschedule
    ```

    2.12 Accept proposed tour reschedule

    ```
    PUT /api/v1/tours/:id/reschedule/:rescheduleId/accept
    ```

    2.13 Reject proposed tour reschedule

    ```
    PUT /api/v1/tours/:id/reschedule/:rescheduleId/reject
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

# Service Responsibilities, Permissions, Communication and Events

## 1. iam service

- Responsibilities: Manage account creation and permissions, authentication/authorization for other services.

- Communication:

  - Synchronous

    - Provides authentication for other services.

      - APIs:
        - POST /iam/login
        - POST /iam/register

  - Asynchronous

    - Emits user insertion or update events to the event bus.
    - Listens to events from listing service.
    - Listens to events from payment service.
    - Listens to events from appointment service.

      - Events:
        - Publish
          - IAM Change Streams (Insert, Replace and Update Events).
        - Consume
          - Apppointment Change Streams (Update Events - appointment scheduling).
          - Listing Change Streams (Insert, Replace, Update and Delete Events).
          - Payment Change Streams (Payment Status Events).

## 2. listing service

- Responsibilities: Handle creation, updating, and deletion of property listings.

- Permissions:

  - Only users with role -provider- can perform command operations.
  - Other users -admin, realtor, customer- can only perform query operations.

- Communication:

  - Synchronous

    - Provides listing details to cart service

      - APIs:
        - GET /listings
        - GET /listings/:id

  - Asynchronous

    - Emits listing events (Created, Updated, Deleted) to an event bus.
    - Notifies iam -providers- service about listing changes.

      - Events:
        - Publish
          - Listing Change Streams (Insert, Replace and Delete Events).
        - Consume
          - Iam Change Streams (Verified and Account Status Update Events).

## 3. tour service

- Responsibilities: Manages creation and modification of tours.

- Permissions:

  - Only users with role -admin, realtor or customer- can perform command operations.

- Communication:

  - Synchronous

    - Provides endpoints to search, retrieve and modify tours

      - APIs:
        - GET /tours
        - GET|PUT|PATCH|DELETE /tours/:id

  - Asynchronous

    - Listens to payment service events to create a tour.
    - Emits tour created events to the event bus.

      - Events:
        - Publish
          - Tour Change Streams (Insert and Update Events).
        - Consume
          - Payment Change Streams (Payment Status Events).

## 4. availability service

- Responsibilities: Maintains and provides realtor availability status from an in-memory store like amazon elastic cache for redis.

- Permissions:

  - Only users with role -admin- can review commands and perform query operations.

- Communication:

  - Synchronous

    - Provides realtor's availability status to assignment service based on booked tour location.

      - APIs:
        - GET /availability

  - Asynchronous

    - Listens to iam service realtor status updates from the event bus.
    - Listens to appointment service to update realtor's availability status based on booked tours.

      - Events:
        - Publish
          - n/a
        - Consume
          - Iam Change Streams.
          - Appointment Change Streams.

## 5. appointment service

### 5.1. realtor assignment and scheduling service

- Permissions:

  - Only users with role -realtor or customer- can perform command operations.
  - Only users with role -admin- can review commands and perform query operations.

- Responsibilities

  - Fetches available realtors to tours based on location.
  - Filters list based on customer's scheduled time.
  - Assign realtor to tour.

- Communication:

  - Synchronous

    - Interact with availability service to fetch available realtors based on booked tour location.

      - APIs:
        - PATCH /availability/:id

  - Asynchronous

    - Listens to events from the tour service.
    - Emit assignment events to the event bus: the availability service subscribe to this event for further processing.

      - Events:
        - Publish
          - Appointment Change Streams.
        - Consume
          - Tour Change Streams

### 5.2. notification service

- Responsibilities: Notifies customer and realtor of scheduled tour time at intervals.

- Communication:

  - Asynchronous

    - Listens to tour service for changes in appointment schedules.
    - Emit (re)schedule events to topic: iam service is notified about scheduled or rescheduled tour appointments.

      - Events:
        - Publish
          - Notification Events.

## 6. cart service

- Responsibilities: Manage customer carts and list of selected listings.

- Permissions:

  - Only users with role -admin- can review commands.

- Communication:

  - Synchronous

    - Interacts with listing service to fetch listing details.
    - Provides cart details to payment service.

      - APIs:
        - GET /cart
        - POST /cart/checkout

## 7. payment service

- Responsibilities: Handle payment processing and confirmation via payment gateway channels.

- Permissions:

  - Only users with role -admin- can review commands and perform query operations.

- Communication:

  - Synchronous

    - Available to cart service for processing payment requests.

      - APIs:
        - POST /payments

  - Asynchronous

    - Emits payment success events to tour and iam services.

      - Events:
        - Publish
          - Payment Change Streams.
        - Consume
          - n/a

# Communication Flow

1. IAM:

   - User Registration and Authentication.
     - iam service emits a user created event to the event bus.
     - Other services (i.e email notification service, analytics service) can subscribe to this event for further processing.
   - Realtor Updates Availability Status.
     - iam service emits a status updated event to the event bus.
     - Other services (i.e availability service) subscribes to this event for further processing.

2. Listing:

   - Provider creates/updates/deletes a listing via listing service.
   - listing service emits events to the event bus.
   - iam service listens to these events to update the provider's listing records.

3. Tour:
   - Customer adds listings to the cart using cart service.
   - Customer proceeds to payment via payment service.
   - Upon successful payment, payment service emits a payment success event.
     - Tour Service
       - listens to this event to create a tour.
       - emits new tour created event.
       - appointment service listens to assign a realtor and schedule the appointment.
       - appointment service fetches available realtors based on location via availability service.
       - scheduling microservice filters available realtors based on customer scheduled time.
       - assignment microservice assigns realtor.
       - appointment service finalizes the tour appointment and emits an event to update the tour service.
       - notification microservice emits an event to notify the iam service (customer and realtor).
     - Iam Service
       - Listens to this event and updates customers payment records.

# Implementation Logic

1. Communication Implementation

   - Utilizes AWS SQS/SNS/Eventbridge for asynchronous communication and lambda for asynchronous processing.
   - Utilizes eventbridge pipes to either transform, enrich or filter events.

2. Availability and Appointment (Assignment and Scheduling)
   - availability service maintains a cache of realtor statuses -available and booked- based on location usingredis or any suitable in-memory store.
   - tour service emits a tour created event to the bus.
     - appointment service listens and calls availability service to fetch available realtors based on location.
     - on successful appointment scheduling, an event is emitted to update the available and booked realtors pool in the availability service, notify the iam service and complete the tour appointment in the tour service.

## Service Responsibilities, Permissions, Communication and Events

1. iam service

   - Responsibilities: Manage account creation and permissions, authentication/authorization for other services.

   - Communication:
   - Synchronous
     - n/a
   - Asynchronous

     - Emits user insertion or update events to the event bus.
     - Listens to events from listing service.
     - Listens to events from payment service.
     - Listens to events from tours service.

   - Events:
   - Publish
     - IAM Change Streams (Insert, Replace and Update Events).
   - Consume
     - Tour Change Streams (Update Events - realtor tour assignment and customer tour booking and booking).
     - Listing Change Streams (Insert, Replace, Update and Delete Events).
     - Payment Change Streams (Payment Status Events).

2. listing service

   - Responsibilities: Handle creation, updating, and deletion of property listings.

   - Permissions:

     - Only users with role -provider- can perform command operations.
     - Other users -admin, realtors, customers- can only perform query operations.

   - Communication:
   - Synchronous
     - n/a
   - Asynchronous

     - Emits listing events (Created, Updated, Deleted) to an event bus.
     - Notifies iam -providers- service about listing changes.

   - Events:
   - Publish
     - Listing Change Streams (Insert, Replace and Delete Events).
   - Consume
     - Iam Change Streams (Verified and Account Status Update Events).

3. tour service

   - Responsibilities: Manage the booking of tour appointments.

   - Permissions:

     - Only users with role -customer- can perform command operations.

   - Communication:
   - Synchronous
     - n/a
   - Asynchronous

     - Emits tour created or updated events to the event bus.
     - Listens to payment service events to create a tour.
     - Listens to assignment service to assign realtors to tour appointments.
     - Listens to scheduling service to schedule tour appointments.

   - Events:
   - Publish
     - Tour Change Streams (Insert and Update Events).
   - Consume
     - Payment Change Streams (Payment Status Events).
     - Assignment Change Streams.
     - Scheduling Change Streams.

4. availability service

   - Responsibilities: Maintains and provides realtor availability status from an in-memory store like amazon elastic cache for redis.

   - Permissions:

     - Only users with role -admin- can review commands and perform query operations.

   - Communication:
   - Synchronous
     - Provides realtor's availability status to assignment service based on booked tour location.
   - Asynchronous

     - Listens to iam service realtor status updates from the event bus.
     - Listens to assignment service to update realtor's availability status based on booked tours.

   - Events:
   - Publish
     - n/a
   - Consume
     - Iam Change Streams.
     - Assignment Change Streams.

5. assignment service

   - Responsibilities: Fetches and assign realtors to tours based on availability and location.

   - Permissions:

     - Only users with role -admin- can review commands and perform query operations.

   - Communication:
   - Synchronous

     - Interact with availability service to fetch available realtors based on booked tour location.

   - Asynchronous

     - Listens to events from tour service.
     - Emit assignment events to the event bus: tour and availability services subscribe to this event for further processing.

   - Events:
   - Publish
     - Assignment Change Streams.
   - Consume
     - Tour Change Streams.

6. scheduling service

   - Responsibilities: Schedule appointments for tours.

   - Permissions:

     - Only users with role -admin- can review commands and perform query operations.

   - Communication:
   - Synchronous

     - n/a

   - Asynchronous

     - Listens to tour creation events.
     - Emit schedule events to event bus: tour service is notified about scheduled or rescheduled dates.

   - Events:
   - Publish
     - Schedule Change Streams.
   - Consume
     - Tour Change Streams.

7. cart service

   - Responsibilities: Manage customer carts and list of selected listings.

   - Permissions:

     - Only users with role -admin- can review commands.

   - Communication:
   - Synchronous
     - Interacts with listing service to fetch listing details.
     - Provides cart details to payment service.
   - Asynchronous

     - n/a

   - Events:
   - Publish
     - n/a
   - Consume
     - n/a

8. payment service

   - Responsibilities: Handle payment processing and confirmation via payment gateway channels.

   - Permissions:

     - Only users with role -admin- can review commands and perform query operations.

   - Communication:
   - Synchronous

     - Available to cart service for payment requests.

   - Asynchronous

     - Emits payment success events to tour and iam services.

   - Events:
   - Publish
     - Payment Change Streams.
   - Consume
     - n/a

## Communication Flow

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
     - assignment service fetches available realtors based on location via availability service.
     - tour service notifies assignment service to assign a realtor.
     - assignment service updates realtor status and notifies availability service.
     - tour service notifies scheduling service to schedule the appointment.
     - scheduling service finalizes the appointment and notifies the customer and realtor.
   - Iam Service
     - listens to this event and updates customers payment records.

## Implementation Logic

1. Event Bus Implementation

   - Utilizes AWS SQS/Eventbridge for asynchronous communication and lambda for asynchronous processing.
   - Utilizes eventbridge pipes to either transform, enrich or filter events.

2. Availability, Assignment and Scheduling
   - availability service maintains a cache of realtor statuses -available and booked- based on location using Redis or any suitable in-memory store.
   - tour service emits a tour created event to the bus.
     - assignment service listens and calls availability service to fetch available realtors based on location.
     - on successful assignment, an event is emitted to update the available pool in the availability service and tour service.
     - scheduling service uses this information from the tour event to schedule tours and update statuses.
   - tour service listens to assignment and scheduling services to get real-time events on realtor assignment and tour scheduling.
   - tour service emits event on successful assignment and scheduling.

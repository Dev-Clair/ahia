import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import IdempotencyMiddleware from "../middleware/idempotencyMiddleware";
import ListingMiddleware from "../middleware/listingMiddleware";
import PaymentverificationMiddleware from "../middleware/paymentverificationMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ListingController from "../controller/listingController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "[a-zA-Z0-9]+";

const ListingRouter = Router();

ListingRouter.route("/")
  .get(AuthMiddleware.isGranted([""]), ListingController.retrieveListings)
  .post(
    AuthMiddleware.isGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterInsertion(["media"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateListing,
    ListingController.createListing
  );

ListingRouter.route(`/offerings`).get(
  AuthMiddleware.isGranted([""]),
  ListingController.retrieveListingsByOfferingSearch
);

ListingRouter.route(`/provider/:id(${IdParamRegex})`).get(
  AuthMiddleware.isGranted([""]),
  ListingController.retrieveListingsByProvider
);

ListingRouter.route("/type/:type").get(
  AuthMiddleware.isGranted([""]),
  ListingController.retrieveListingsByType
);

ListingRouter.route("/search").get(
  AuthMiddleware.isGranted([""]),
  ListingController.retrieveListingsSearch
);

ListingRouter.route("/near-me").get(
  AuthMiddleware.isGranted([""]),
  ListingController.retrieveListingsNearUser
);

ListingRouter.route(`/:id(${IdParamRegex})`)
  .get(
    AuthMiddleware.isGranted([""]),
    ValidationMiddleware.validateID,
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingById
  )
  .patch(
    AuthMiddleware.isGranted(["Provider"]),
    ListingMiddleware.filterUpdate(["address", "location", "type"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ListingController.updateListingById
  )
  .delete(
    AuthMiddleware.isGranted(["Provider"]),
    ValidationMiddleware.validateID,
    ListingController.deleteListingById
  );

ListingRouter.route(`/:id(${IdParamRegex})/offerings/:type`)
  .get(
    AuthMiddleware.isGranted([""]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingOfferings
  )
  .post(
    AuthMiddleware.isGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterInsertion(["media", "verification"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    ValidationMiddleware.validateOffering,
    DocumentMiddleware("listing", "id"),
    ListingController.createListingOffering
  );

ListingRouter.route(
  `/:id(${IdParamRegex})/offerings/:type/:offeringId(${IdParamRegex})`
)
  .get(
    AuthMiddleware.isGranted([""]),
    DocumentMiddleware("listing", "id"),
    ListingController.retrieveListingOfferingById
  )
  .patch(
    AuthMiddleware.isGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterUpdate(["category", "type", "verification"]),
    IdempotencyMiddleware.isIdempotent,
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("listing", "id"),
    PaymentverificationMiddleware.verifyOfferingPaymentStatus,
    ListingController.updateListingOfferingById
  )
  .delete(
    AuthMiddleware.isGranted(["Provider"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("listing", "id"),
    ListingController.deleteListingOfferingById
  );

ListingRouter.route(`/:id(${IdParamRegex})/offering/:type`).get(
  AuthMiddleware.isGranted([""]),
  ValidationMiddleware.validateType,
  ListingController.retrieveListingByIdAndPopulate
);

ListingRouter.route(
  `/:slug(${SlugParamRegex})/offerings/:type/:offeringSlug(${SlugParamRegex})`
).get(
  AuthMiddleware.isGranted([""]),
  ValidationMiddleware.validateType,
  DocumentMiddleware("listing", "slug"),
  ListingController.retrieveListingOfferingBySlug
);

ListingRouter.route(`/:slug(${SlugParamRegex})/offering/:type`).get(
  AuthMiddleware.isGranted([""]),
  ValidationMiddleware.validateType,
  ListingController.retrieveListingBySlugAndPopulate
);

ListingRouter.route(`/:slug(${SlugParamRegex})`).get(
  AuthMiddleware.isGranted([""]),
  DocumentMiddleware("listing", "slug"),
  ListingController.retrieveListingBySlug
);

export default ListingRouter;

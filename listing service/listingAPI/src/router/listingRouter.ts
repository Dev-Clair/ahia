import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleware from "../middleware/listingMiddleware";
import PaymentverificationMiddleware from "../middleware/paymentverificationMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ListingController from "../controller/listingController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "[a-zA-Z0-9]+";

const ListingRouter = Router();

ListingRouter.route("/")
  .get(ListingController.retrieveListings)
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterInsertion(["media"]),
    ValidationMiddleware.validateListing,
    ListingController.createListing
  );

ListingRouter.route(`/provider/:id(${IdParamRegex})`).get(
  ListingController.retrieveListingsByProvider
);

ListingRouter.route("/type/:type").get(
  ListingController.retrieveListingsByType
);

ListingRouter.route("/search").get(ListingController.retrieveListingsSearch);

ListingRouter.route("/near-me").get(ListingController.retrieveListingsNearme);

ListingRouter.route("/offerings").get(
  ListingController.retrieveListingsByOfferingSearch
);

ListingRouter.route(`/:id(${IdParamRegex})`)
  .get(
    ValidationMiddleware.validateID,
    DocumentMiddleware("id"),
    ListingController.retrieveListingById
  )
  .patch(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.filterUpdate(["address", "location", "type"]),
    ValidationMiddleware.validateID,
    ListingController.updateListingById
  )
  .delete(
    AuthMiddleware.IsGranted(["Provider"]),
    ValidationMiddleware.validateID,
    ListingController.deleteListingById
  );

ListingRouter.route(`/:id(${IdParamRegex})/offerings/:type`)
  .get(
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("id"),
    ListingController.retrieveListingOfferings
  )
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterInsertion(["media", "verification"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    ValidationMiddleware.validateOffering,
    DocumentMiddleware("id"),
    ListingController.createListingOffering
  );

ListingRouter.route(
  `/:id(${IdParamRegex})/offerings/:type/:offeringId(${IdParamRegex})`
)
  .get(DocumentMiddleware("id"), ListingController.retrieveListingOfferingById)
  .patch(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterUpdate(["category", "type", "use", "verification"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("id"),
    ListingController.updateListingOfferingById
  )
  .delete(
    AuthMiddleware.IsGranted(["Provider"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateType,
    DocumentMiddleware("id"),
    ListingController.deleteListingOfferingById
  );

ListingRouter.route(
  `/:id(${IdParamRegex})/offerings/:type/:offeringId(${IdParamRegex})`
).get(
  ValidationMiddleware.validateID,
  ValidationMiddleware.validateType,
  DocumentMiddleware("id"),
  ListingController.retrieveListingOfferingById
);

ListingRouter.route(`/:id(${IdParamRegex})/type/:type`).get(
  ValidationMiddleware.validateType,
  ListingController.retrieveListingByIdAndPopulate
);

ListingRouter.route(`/:slug(${SlugParamRegex})`).get(
  DocumentMiddleware("slug"),
  ListingController.retrieveListingBySlug
);

ListingRouter.route(`/:slug(${SlugParamRegex})/type/:type`).get(
  ValidationMiddleware.validateType,
  ListingController.retrieveListingBySlugAndPopulate
);

ListingRouter.route(
  `/:slug(${SlugParamRegex})/offerings/:type/:offeringSlug(${SlugParamRegex})`
).get(
  ValidationMiddleware.validateType,
  DocumentMiddleware("slug"),
  ListingController.retrieveListingOfferingBySlug
);

export default ListingRouter;

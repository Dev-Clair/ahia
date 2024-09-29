import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleware from "../middleware/listingMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ListingController from "../controller/listingController";

const ListingRouter = Router();

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "[a-zA-Z0-9]+";

ListingRouter.route("/")
  .get(ListingController.retrieveListings)
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterInsertion(["media", "verification"]),
    ValidationMiddleware.validateListing,
    ListingController.createListing
  );

ListingRouter.route(`/offerings/:type`).get(
  ListingController.retrieveOfferings
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
  ListingController.retrieveListingsByOfferings
);

ListingRouter.route(`/:id(${IdParamRegex})`)
  .get(
    ValidationMiddleware.validateID,
    DocumentMiddleware("id"),
    ListingController.retrieveListingById
  )
  .patch(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.filterUpdate(["type", "address", "location"]),
    ValidationMiddleware.validateID,
    ListingController.updateListingById
  )
  .delete(
    AuthMiddleware.IsGranted(["Provider"]),
    ValidationMiddleware.validateID,
    ListingController.deleteListingById
  );

ListingRouter.route(
  `/:id(${IdParamRegex})/offerings/:offeringId(${IdParamRegex})`
)
  .get(
    ValidationMiddleware.validateID,
    ListingController.retrieveListingOfferingById
  )
  .patch(
    ValidationMiddleware.validateID,
    ListingController.updateListingOffering
  )
  .delete(
    ValidationMiddleware.validateID,
    ListingController.deleteListingOffering
  );

ListingRouter.route(
  `/:id(${IdParamRegex})/offerings/:offeringSlug(${SlugParamRegex})`
).get(ListingController.retrieveListingOfferingBySlug);

ListingRouter.route(`/:id(${IdParamRegex})/offerings/:type`)
  .get(
    ValidationMiddleware.validateID,
    ListingController.retrieveListingByIdAndPopulate
  )
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterInsertion(["media"]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateOffering,
    DocumentMiddleware("id"),
    ListingController.createListingOffering
  );

ListingRouter.route(`/:id(${IdParamRegex})/status`)
  .get(
    AuthMiddleware.IsGranted(["Provider"]),
    ValidationMiddleware.validateID,
    ListingController.checkListingStatus
  )
  .patch(
    AuthMiddleware.IsGranted(["Admin"]),
    ListingMiddleware.isContentType(["application/json"]),
    ValidationMiddleware.validateID,
    ListingController.changeListingStatus
  );

ListingRouter.route(`/:slug(${SlugParamRegex})`).get(
  DocumentMiddleware("slug"),
  ListingController.retrieveListingBySlug
);

ListingRouter.route(`/:slug(${SlugParamRegex})/offerings/:type`)
  .get(ListingController.retrieveListingBySlugAndPopulate)
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterInsertion(["media"]),
    ValidationMiddleware.validateOffering,
    DocumentMiddleware("slug"),
    ListingController.createListingOffering
  );

export default ListingRouter;

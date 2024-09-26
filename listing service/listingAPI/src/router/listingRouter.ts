import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleware from "../middleware/listingMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ListingController from "../controller/listingController";

const ListingRouter = Router();

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "[a-zA-Z0-9]";

const TypeParamRegex = "[lease|reservation|sell]";

ListingRouter.route("/")
  .get(ListingController.retrieveListings)
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterInsertion(["media", "verification"]),
    ValidationMiddleware.validateListing,
    ListingController.createListing
  );

ListingRouter.route("/search").get(ListingController.retrieveListingsSearch);

ListingRouter.route("/near-me").get(ListingController.retrieveListingsNearme);

ListingRouter.route(`/provider/:id(${IdParamRegex})`).get(
  ListingController.retrieveListingsByProvider
);

ListingRouter.route("/type/:type").get(
  ListingController.retrieveListingsByType
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

ListingRouter.route(`/:id(${IdParamRegex})/type`).patch(
  AuthMiddleware.IsGranted(["Admin"]),
  ListingMiddleware.isContentType(["application/json"]),
  ValidationMiddleware.validateID,
  ListingController.updateListing
);

ListingRouter.route(`/:id(${IdParamRegex})/offerings/:type(${TypeParamRegex})`)
  .get(
    ValidationMiddleware.validateID,
    ListingController.retrieveListingByIdWithOfferings
  )
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterInsertion([]),
    ValidationMiddleware.validateID,
    ValidationMiddleware.validateOffering,
    ListingController.createListingOffering
  );

ListingRouter.route(
  `/:slug(${IdParamRegex})/offerings/:type(${TypeParamRegex})`
).get(
  DocumentMiddleware("slug"),
  ListingController.retrieveListingBySlugWithOfferings
);

ListingRouter.route(
  `/:id(${IdParamRegex})/offerings/:type(${TypeParamRegex})/:offeringId(${IdParamRegex})`
)
  .get(DocumentMiddleware("id"))
  .patch()
  .delete();

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
    ListingController.updateListing
  )
  .delete(
    AuthMiddleware.IsGranted(["Provider"]),
    ValidationMiddleware.validateID,
    ListingController.deleteListing
  );

ListingRouter.route(`/:slug(${SlugParamRegex})`).get(
  DocumentMiddleware("slug"),
  ListingController.retrieveListingBySlug
);

export default ListingRouter;

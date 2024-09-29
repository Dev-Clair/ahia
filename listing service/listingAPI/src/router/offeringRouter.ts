import { Router } from "express";
import AuthMiddleware from "../middleware/authMiddleware";
import DocumentMiddleware from "../middleware/documentMiddleware";
import ListingMiddleware from "../middleware/listingMiddleware";
import ValidationMiddleware from "../middleware/validationMiddleware";
import ListingController from "../controller/listingController";

const IdParamRegex = "[0-9a-fA-F]{24}";

const SlugParamRegex = "[a-zA-Z0-9]+";

const OfferingRouter = Router();

OfferingRouter.route("/")
  .get(ListingController.retrieveListingByIdAndPopulate)
  .post(
    AuthMiddleware.IsGranted(["Provider"]),
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterInsertion(["media"]),
    ValidationMiddleware.validateOffering,
    DocumentMiddleware("id"),
    ListingController.createListingOffering
  );

OfferingRouter.route(`/:offeringId(${IdParamRegex})`)
  .get(DocumentMiddleware("id"), ListingController.retrieveListingOfferingById)
  .patch(
    ListingMiddleware.isContentType(["application/json"]),
    ListingMiddleware.filterUpdate(["category", "type", "use"]),
    DocumentMiddleware("id"),
    ListingController.updateListingOfferingById
  )
  .delete(
    DocumentMiddleware("id"),
    ListingController.deleteListingOfferingById
  );

OfferingRouter.route(`/:offeringSlug(${SlugParamRegex})`).get(
  DocumentMiddleware("id"),
  ListingController.retrieveListingOfferingBySlug
);

export default OfferingRouter;

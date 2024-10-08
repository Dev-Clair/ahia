// import IPromotion from "./IPromotion";
// import IRepository from "./IRepository";

// export default interface IPromotionRepository extends IRepository<IPromotion> {
//   /**
//    * Retrieves a collection of promotions
//    * @param queryString query object
//    * @param options configuration options
//    */
//   findAll(
//     queryString: Record<string, any>,
//     options?: { [key: string]: any }
//   ): Promise<IPromotion[]>;

//   /**
//    * Retrieves a promotion by id
//    * @param id promotion id
//    * @param options configuration options
//    */
//   findById(
//     id: string,
//     options?: { [key: string]: any }
//   ): Promise<IPromotion | null>;

//   /**
//    * Retrieves a promotion by id and populate its subdocument
//    * @param id promotion id
//    * @param options configuration options
//    */
//   findByIdAndPopulate(
//     id: string,
//     options?: { [key: string]: any }
//   ): Promise<IPromotion | null>;

//   /**
//    * Creates a new promotion in collection
//    * @param payload data object
//    * @param options configuration options
//    */
//   save(
//     payload: Partial<IPromotion>,
//     options?: { [key: string]: any }
//   ): Promise<string>;

//   /**
//    * Updates a promotion by id
//    * @param id promotion id
//    * @param payload data object
//    * @param options configuration options
//    */
//   update(
//     id: string,
//     payload: Partial<IPromotion | any>,
//     options?: { [key: string]: any }
//   ): Promise<string>;

//   /**
//    * Deletes a promotion by id
//    * @param id promotion id
//    * @param options configuration options
//    */
//   delete(id: string, options?: { [key: string]: any }): Promise<string>;
// }

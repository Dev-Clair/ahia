import SpaceTypes from "./spaceTypes";

export default interface ISpace {
  category: keyof typeof SpaceTypes;
  type: (typeof SpaceTypes)[ISpace["category"]][number];
}

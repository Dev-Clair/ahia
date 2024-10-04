import SpaceTypes from "../constant/spaceTypes";

export default interface ISpace {
  name: keyof typeof SpaceTypes;
  type: (typeof SpaceTypes)[ISpace["name"]][number];
}

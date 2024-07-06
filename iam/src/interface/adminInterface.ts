import IAMInterface from "./iamInterface";

export default interface AdminInterface extends IAMInterface {
  permissions: string[];
}

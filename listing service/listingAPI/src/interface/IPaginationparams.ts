export default interface IPaginationParams extends Record<string, any> {
  leasePage?: string;
  leaseLimit?: string;
  reservationPage?: string;
  reservationLimit?: string;
  sellPage?: string;
  sellLimit?: string;
  [key: string]: unknown;
}

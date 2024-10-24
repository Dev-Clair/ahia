export default interface IPaginationParams extends Record<string, any> {
  leasePage?: string;
  leaseLimit?: string;
  reservationPage?: string;
  reservationLimit?: string;
  sellsPage?: string;
  sellsLimit?: string;
  [key: string]: any;
}

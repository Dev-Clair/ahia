export default interface IQueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

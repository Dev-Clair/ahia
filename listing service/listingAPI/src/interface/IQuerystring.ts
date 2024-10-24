export default interface IQueryString extends Record<string, any> {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

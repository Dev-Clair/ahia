export default interface IQueryString extends Record<string, any> {
  page?: string|number;
  limit?: string|number;
  fields?: string;
  sort?: string;
  [key: string]: unknown;
}

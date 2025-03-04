export default interface IQueryString extends Record<string, any> {
  page?: string | number;
  limit?: string | number;
  fields?: string | (() => string | undefined);
  sort?: string;
  [key: string]: unknown;
}

export default interface QueryStringInterface {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any;
}

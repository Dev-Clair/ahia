export default interface IPaginate extends Record<string, any> {
  page: number;
  limit: number;
  [key: string]: unknown;
}

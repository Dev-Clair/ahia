export default interface IHttpRequestOptions {
  hostname: string;
  path: string;
  method?: string;
  headers?: Record<string, string>;
}

export default interface HttpRequestOptionsInterface {
  hostname: string;
  path: string;
  method?: string;
  headers?: Record<string, string>;
}

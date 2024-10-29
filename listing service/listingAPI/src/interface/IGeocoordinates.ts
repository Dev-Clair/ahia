export default interface IGeoCoordinates extends Record<string, any> {
  lat: number;
  lng: number;
  distance?: number;
  radius?: number;
  [key: string]: any;
}

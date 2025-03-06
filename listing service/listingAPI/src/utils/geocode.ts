export default class Geocode {
  /**
   * Verifies if the provided geoCoordinates are within valid ranges
   * @param geoCoordinates - Array containing [lat, lng]
   */
  static verifyGeoCoordinates(geoCoordinates: number[]): boolean {
    if (!Array.isArray(geoCoordinates) || geoCoordinates.length !== 2) {
      return false;
    }

    const [lat, lng] = geoCoordinates;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return false;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return false;
    }

    return true;
  }
}

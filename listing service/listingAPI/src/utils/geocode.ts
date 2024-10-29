import Config from "../../config";
import HttpClient from "./httpClient";
import IHttpResponse from "../interface/IHttpresponse";

export default class Geocode {
  /**
   * Retrieves an address' coordinates using Google Maps Geocode API
   * @param address - The full address to geocode
   * @returns An object containing statusCode and response body
   */
  static async getGeoCoordinates(address: string): Promise<IHttpResponse> {
    const parsedAddress = encodeURIComponent(address);

    const url = `${Config.GOOGLE_MAP_API.GEOCODE_URL}address=${parsedAddress}&key=${Config.GOOGLE_MAP_API.KEY}`;

    const headers = { "content-type": "application/json" };

    try {
      const httpClient = HttpClient.Create(url, headers);

      const response = await httpClient.Get();

      const { statusCode, body } = response;

      return { statusCode, body };
    } catch (error: any) {
      throw new Error(
        `Failed to make request to Geocode API:\n${error.message}`
      );
    }
  }

  /**
   * Retrieves a location's address using Google Maps Places API
   * @param geoCoordinates - Expected format: "lat,lng"
   */
  static async getAddress(geoCoordinates: string): Promise<IHttpResponse> {
    if (!/^[-+]?[0-9]\.?[0-9]+,[-+]?[0-9]\.?[0-9]+$/.test(geoCoordinates)) {
      throw new Error("Invalid geoCoordinates format. Expected 'lat,lng'.");
    }

    const parsedGeoCoordinates = encodeURIComponent(geoCoordinates);

    const url = `${Config.GOOGLE_MAP_API.PLACE_URL}latlng=${parsedGeoCoordinates}&key=${Config.GOOGLE_MAP_API.KEY}`;

    const headers = { "content-type": "application/json" };

    try {
      const httpClient = HttpClient.Create(url, headers);

      const response = await httpClient.Get();

      const { statusCode, body } = response;

      return { statusCode, body };
    } catch (error: any) {
      throw new Error(
        `Failed to make request to Geocode API:\n${error.message}`
      );
    }
  }

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

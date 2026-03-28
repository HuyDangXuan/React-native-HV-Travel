import { ApiService } from "./ApiService";
import api from "../config/api";
import { normalizeTour, normalizeTours } from "./dataAdapters";

export class TourService {
  static getTours = async () => {
    const response = await ApiService.fetchWithTimeout(api.get_list_tours);
    return normalizeTours(response);
  };

  static getTourDetail = async (id: string) => {
    const response = await ApiService.fetchWithTimeout(api.get_tour_detail(id));
    return normalizeTour(response?.data ?? response);
  };

  static getCityById = async (id: string) => ApiService.fetchWithTimeout(`${api.get_list_tours}?cityId=${id}`); // Fallback logic
}

import { ApiService } from "./ApiService";
import api from "../config/api";

export class TourService {
  static getTours = async () => ApiService.fetchWithTimeout(api.get_list_tours);
  static getTourDetail = async (id:string) => ApiService.fetchWithTimeout(api.get_tour_detail(id));
  static getCities = async () => ApiService.fetchWithTimeout(api.get_list_cities);
  static getCityById = async (id: string) => ApiService.fetchWithTimeout(api.get_city_detail(id));
  static getCategories = async () => ApiService.fetchWithTimeout(api.get_list_categories);
}
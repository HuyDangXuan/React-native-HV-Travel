import { ApiService } from "./ApiService";
import api from "../config/api";

export class TourService {
  static getTours = async () => ApiService.fetchWithTimeout(api.get_list_tours);
  static getCities = async () => ApiService.fetchWithTimeout(api.get_list_cities);
  static getCategories = async () => ApiService.fetchWithTimeout(api.get_list_categories);
}
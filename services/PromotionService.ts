import { ApiService } from "./ApiService";
import api from "../config/api";

export class PromotionService {
  static getPromotions = async () => {
    return ApiService.fetchWithTimeout(api.get_promotions);
  };
}

import { ApiService } from "./ApiService";
import api from "../config/api";

export class ReviewService {
  static getReviewsByTour = async (tourId: string) => {
    return ApiService.fetchWithTimeout(api.get_reviews_by_tour(tourId));
  };

  static createReview = async (token: string, data: Record<string, any>) => {
    return ApiService.fetchWithTimeout(api.create_review, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };
}

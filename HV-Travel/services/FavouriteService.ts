import { ApiService } from "./ApiService";
import api from "../config/api";

export class FavouriteService {
  static getFavourites = async () =>
    ApiService.fetchWithTimeout(api.get_list_favourites);

  static addByTourId = async (tourId: string) =>
    ApiService.fetchWithTimeout(api.add_favourite_by_tour(tourId), {
      method: "POST",
    });

  static deleteByTourId = async (tourId: string) =>
    ApiService.fetchWithTimeout(api.delete_favourite_by_tour(tourId), {
      method: "DELETE",
    });
}

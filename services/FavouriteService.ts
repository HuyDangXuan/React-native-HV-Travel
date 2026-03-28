import { ApiService } from "./ApiService";
import api from "../config/api";
import { extractFavouriteTourIds, normalizeFavourites } from "./dataAdapters";

export class FavouriteService {
  static extractFavouriteTourIds = extractFavouriteTourIds;

  static getFavourites = async (authToken: string) => {
    const response = await ApiService.fetchWithTimeout(api.get_list_favourites, {
      method: "GET",
      headers: { "Authorization": "Bearer " + authToken },
    });
    return normalizeFavourites(response);
  };
    

  static addByTourId = async (authToken: string, tourId: string) =>{
    return ApiService.fetchWithTimeout(api.add_favourite_by_tour(tourId), {
      method: "POST",
      headers: { "Authorization": "Bearer " + authToken },
    });
  }
    

  static deleteByTourId = async (authToken: string, tourId: string) => {
    return ApiService.fetchWithTimeout(api.delete_favourite_by_tour(tourId), {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + authToken },
    });
  };
    
}

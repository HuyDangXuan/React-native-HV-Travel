const base_url = "https://hv-travel-api.vercel.app/api";

const api = {
    check_connect_db: base_url + "/test",
    get_list_tours: base_url + "/tours",
    get_list_cities: base_url + "/cities",
    get_list_categories: base_url + "/categories",
}

export default api;
const base_url = "https://hv-travel-api.vercel.app/api";
//const base_url = "http://192.168.239.22:3000/api";

const api = {
    check_connect_db: base_url + "/test",
    login: base_url + "/auth/login",
    me: base_url + "/auth/me",
    logout: base_url + "/auth/logout",
    register: base_url + "/auth/register",
    forgot_password: base_url + "/auth/forgot-password",
    verify_otp: base_url + "/auth/verify-otp",
    reset_password: base_url + "/auth/reset-password",
    change_password: base_url + "/auth/change-password",
    get_list_tours: base_url + "/tours/list",
    get_tour_detail: (id: string) => `${base_url}/tours/${id}`,
    get_list_cities: base_url + "/cities/list",
    get_city_detail: (id: string) => `${base_url}/cities/${id}`,
    get_list_categories: base_url + "/categories/list",
    get_list_favourites: base_url + "/favourites/list",
    delete_favourite_by_tour: (tourId: string) => `${base_url}/favourites/tour/${tourId}`,

}

export default api;
const base_url = "https://hv-travel-api.vercel.app/api";
// const base_url = "http://192.168.110.22:4000/api";

const api = {
  check_connect_db: base_url + "/test",

  login: base_url + "/auth/login",
  refresh: base_url + "/auth/refresh",
  me: base_url + "/auth/me",
  logout: base_url + "/auth/logout",
  auth_sessions: base_url + "/auth/sessions",
  logout_all_devices: base_url + "/auth/logout-all",
  register: base_url + "/auth/register",
  forgot_password: base_url + "/auth/forgot-password",
  verify_otp: base_url + "/auth/verify-otp",
  reset_password: base_url + "/auth/reset-password",
  change_password: base_url + "/auth/change-password",

  get_customer_profile: base_url + "/customers/profile",
  update_customer_profile: base_url + "/customers/profile",

  get_list_tours: base_url + "/tours/list",
  get_tour_detail: (id: string) => `${base_url}/tours/${id}`,

  get_bookings: base_url + "/bookings",
  get_booking_detail: (id: string) => `${base_url}/bookings/${id}`,
  cancel_booking: (id: string) => `${base_url}/bookings/${id}`,
  create_booking: base_url + "/bookings",

  get_payments: base_url + "/payments/list",
  create_payment: base_url + "/payments",

  get_reviews_by_tour: (tourId: string) => `${base_url}/reviews/tour/${tourId}`,
  create_review: base_url + "/reviews",

  get_list_favourites: base_url + "/favourites/list",
  delete_favourite_by_tour: (tourId: string) => `${base_url}/favourites/tour/${tourId}`,
  add_favourite_by_tour: (tourId: string) => `${base_url}/favourites/tour/${tourId}`,

  get_promotions: base_url + "/promotions/list",

  get_notifications: base_url + "/notifications/list",
  mark_notification_read: (id: string) => `${base_url}/notifications/${id}/read`,

  get_chat_conversations: base_url + "/chat/conversations",
  create_chat_conversation: base_url + "/chat/conversations",
  get_chat_messages: (conversationId: string) =>
    `${base_url}/chat/conversations/${conversationId}/messages`,
  send_chat_message: (conversationId: string) =>
    `${base_url}/chat/conversations/${conversationId}/messages`,
  mark_chat_conversation_read: (conversationId: string) =>
    `${base_url}/chat/conversations/${conversationId}/read`,
  reopen_chat_conversation: (conversationId: string) =>
    `${base_url}/chat/conversations/${conversationId}/reopen`,

  chatbot: base_url + "/chatbot/tour",
};

export default api;

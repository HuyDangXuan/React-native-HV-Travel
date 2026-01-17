import AsyncStorage from "@react-native-async-storage/async-storage";

export class ApiService {
  static fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout = 10000
  ): Promise<any> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      // --- merge headers ---
      const rawHeaders = (options.headers || {}) as Record<string, string>;
      const headers: Record<string, string> = { ...rawHeaders };

      // auto set content-type nếu chưa có và có body (tránh override nếu bạn tự set)
      const hasContentType =
        Object.keys(headers).some((k) => k.toLowerCase() === "content-type");
      if (!hasContentType && options.body) {
        headers["Content-Type"] = "application/json";
      }

      // ✅ auto attach Authorization nếu chưa có
      const hasAuth =
        Object.keys(headers).some((k) => k.toLowerCase() === "authorization");
      if (!hasAuth) {
        const token = await AsyncStorage.getItem("token"); // đổi key nếu bạn lưu khác
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw {
          status: res.status,
          message: data?.message || data?.error || "Request failed",
          errors: data?.errors,
          data,
        };
      }

      return data;
    } catch (err: any) {
      if (err?.name === "AbortError") {
        throw { status: 408, message: "Request timeout" };
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  };
}

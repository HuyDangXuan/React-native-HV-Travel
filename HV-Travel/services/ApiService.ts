export class ApiService {
  static fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout = 10000
  ): Promise<any> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      // merge headers
      const rawHeaders = (options.headers || {}) as Record<string, string>;
      const headers: Record<string, string> = { ...rawHeaders };

      // auto Content-Type nếu có body và chưa set
      const hasContentType = Object.keys(headers).some(
        (k) => k.toLowerCase() === "content-type"
      );
      if (!hasContentType && options.body) {
        headers["Content-Type"] = "application/json";
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

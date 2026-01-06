export class ApiService {
  static fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout = 10000
  ): Promise<any> => {
    try {
      const res = await Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), timeout)
        )
      ]) as Response;

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw {
          status: res.status,
          message: data?.message || "Request failed",
          errors: data?.errors
        };
      }

      return data;
    } catch (err) {
      throw err;
    }
  };
}

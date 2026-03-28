import { AuthSessionService } from "./AuthSessionService";

type RetryableRequestInit = RequestInit & {
  _skipAuthRefresh?: boolean;
};

export class ApiService {
  static fetchWithTimeout = async (
    url: string,
    options: RetryableRequestInit = {},
    timeout = 10000
  ): Promise<any> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const rawHeaders = (options.headers || {}) as Record<string, string>;
      const headers: Record<string, string> = { ...rawHeaders };

      const hasContentType = Object.keys(headers).some(
        (key) => key.toLowerCase() === "content-type"
      );

      if (!hasContentType && options.body) {
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);
      const authorizationHeader =
        headers.Authorization || headers.authorization || "";

      if (
        response.status === 401 &&
        !options._skipAuthRefresh &&
        typeof authorizationHeader === "string" &&
        authorizationHeader.startsWith("Bearer ")
      ) {
        const refreshedSession = await AuthSessionService.refreshSession();

        return this.fetchWithTimeout(
          url,
          {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${refreshedSession.accessToken}`,
            },
            _skipAuthRefresh: true,
          },
          timeout
        );
      }

      if (!response.ok) {
        throw {
          status: response.status,
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

export class ApiService {
  static fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 10000
  ): Promise<any> => {
  let res: Response;

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    res = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    clearTimeout(id);
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      throw {
        status: res.status,
        message: data?.message || res.statusText,
        data
      };
    }

    return data;
  } catch (err: any) {
    throw err;
  }
};

}

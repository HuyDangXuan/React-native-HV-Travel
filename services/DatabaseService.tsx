import { ApiService } from "./ApiService";
import api from "../config/api";

export class DatabaseService {
    static checkConnection = async (): Promise<boolean> => {
        try {
            const data = await ApiService.fetchWithTimeout(api.check_connect_db, {}, 5000);
            return !!data.status;
        }
        catch {
            return false;
        }
    };
    static async checkConnectionTestDelay5s(): Promise<boolean> {
        return new Promise((resolve) => {
        setTimeout(() => {
            resolve(false); // trả false sau 5s để test timeout
        }, 5000);
    });
  }
}

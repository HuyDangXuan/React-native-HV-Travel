"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountStorageService = void 0;
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const KEY = "SAVED_ACCOUNTS";
class AccountStorageService {
    static async getAccounts() {
        const raw = await async_storage_1.default.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    }
    static async saveAccount(account) {
        const accounts = await this.getAccounts();
        // xoá trùng email
        const filtered = accounts.filter((a) => a.email !== account.email);
        filtered.unshift(account); // account mới lên đầu
        await async_storage_1.default.setItem(KEY, JSON.stringify(filtered));
    }
    static async removeAccount(id) {
        const accounts = await this.getAccounts();
        const newAccounts = accounts.filter((a) => a.id !== id);
        await async_storage_1.default.setItem(KEY, JSON.stringify(newAccounts));
    }
    static async clearAll() {
        await async_storage_1.default.removeItem(KEY);
    }
}
exports.AccountStorageService = AccountStorageService;

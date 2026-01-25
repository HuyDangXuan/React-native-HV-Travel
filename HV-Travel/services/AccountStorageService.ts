import AsyncStorage from "@react-native-async-storage/async-storage";

export interface StoredAccount {
  id: string;
  fullName: string,
  email: string;
  avatar?: any;
  lastLoginAt: number;
}

const KEY = "SAVED_ACCOUNTS";

export class AccountStorageService {
  static async getAccounts(): Promise<StoredAccount[]> {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  }

  static async saveAccount(account: StoredAccount) {
    const accounts = await this.getAccounts();

    // xoá trùng email
    const filtered = accounts.filter(
      (a) => a.email !== account.email
    );

    filtered.unshift(account); // account mới lên đầu

    await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
  }

  static async removeAccount(id: string) {
    const accounts = await this.getAccounts();
    const newAccounts = accounts.filter(
      (a) => a.id !== id
    );
    await AsyncStorage.setItem(KEY, JSON.stringify(newAccounts));
  }

  static async clearAll() {
    await AsyncStorage.removeItem(KEY);
  }
}

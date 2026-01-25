import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { AuthService } from "../services/AuthService";
import { useUser } from "./UserContext";
import { User } from "../models/User";

interface AuthContextType {
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithToken: (token: string) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser } = useUser();

  // restore session
  useEffect(() => {
    (async () => {
      const savedToken = await SecureStore.getItemAsync("access_token");
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await AuthService.authToken(savedToken);
        setToken(savedToken);
        setUser(res.data as User);
      } catch {
        await SecureStore.deleteItemAsync("access_token");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await AuthService.login(email, password);

    const token = res.data.token;
    const user: User = res.data.user;

    setToken(token);
    setUser(user);

    await SecureStore.setItemAsync("access_token", token);
    return user;
  };

  const signInWithToken = async (token: string) => {
    const res = await AuthService.authToken(token);
    const user = res.data as User;

    setToken(token);
    setUser(user);

    await SecureStore.setItemAsync("access_token", token);
    return user;
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync("access_token");
  };

  return (
    <AuthContext.Provider
      value={{ token, loading, signIn, signInWithToken, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

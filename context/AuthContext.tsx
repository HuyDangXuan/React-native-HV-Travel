import React, { createContext, useContext, useEffect, useState } from "react";

import { Customer } from "../models/Customer";
import { AuthService } from "../services/AuthService";
import { AuthSessionService } from "../services/AuthSessionService";
import { useUser } from "./UserContext";

interface AuthContextType {
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<Customer>;
  signInWithToken: (token: string) => Promise<Customer>;
  signInWithRememberedAccount: (customerId: string) => Promise<Customer>;
  signOut: () => Promise<void>;
  logoutDeviceSession: (sessionId: string, isCurrent?: boolean) => Promise<void>;
  logoutAllDevices: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser } = useUser();

  useEffect(() => {
    const unsubscribe = AuthSessionService.subscribe((session) => {
      setToken(session?.accessToken ?? null);
      setUser(session?.customer ?? null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      let restoredSession = await AuthSessionService.getSession();

      try {
        const restoreResult = await AuthSessionService.restoreSession();
        restoredSession = restoreResult.session;

        if (!restoredSession) {
          if (active) {
            setToken(null);
            setUser(null);
          }
          return;
        }

        const customer = await AuthService.authToken(restoredSession.accessToken);
        const updatedSession = await AuthSessionService.updateCustomer(customer);

        if (active) {
          setToken(updatedSession?.accessToken ?? restoredSession.accessToken);
          setUser(customer);
        }
      } catch (error: any) {
        if (error?.status === 401 || !restoredSession?.customer) {
          await AuthSessionService.clearSession();
          if (active) {
            setToken(null);
            setUser(null);
          }
          return;
        }

        if (active) {
          setToken(restoredSession.accessToken);
          setUser(restoredSession.customer);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [setUser]);

  const signIn = async (email: string, password: string) => {
    const deviceId = await AuthSessionService.getOrCreateDeviceId();
    const response = await AuthService.login(email, password, deviceId);
    const session = await AuthSessionService.setSessionFromAuthResponse(response);

    if (!session.customer) {
      throw { status: 500, message: "Không lấy được thông tin tài khoản" };
    }

    setToken(session.accessToken);
    setUser(session.customer);
    return session.customer;
  };

  const signInWithRememberedAccount = async (customerId: string) => {
    const customer = await AuthSessionService.resumeRememberedAccount(customerId);
    const session = await AuthSessionService.getSession();

    setToken(session?.accessToken ?? null);
    setUser(customer);
    return customer;
  };

  const signInWithToken = async (accessToken: string) => {
    const customer = await AuthService.authToken(accessToken);

    setToken(accessToken);
    setUser(customer);
    return customer;
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await AuthSessionService.softLogout();
  };

  const logoutDeviceSession = async (sessionId: string, isCurrent = false) => {
    const session = await AuthSessionService.getSession();

    if (!session?.accessToken) {
      throw { status: 401, message: "Phiên đăng nhập đã hết hạn" };
    }

    if (isCurrent) {
      await AuthService.logout(session.accessToken);
      setToken(null);
      setUser(null);
      await AuthSessionService.clearSession();
      return;
    }

    await AuthService.logoutSession(session.accessToken, sessionId);
  };

  const logoutAllDevices = async () => {
    const session = await AuthSessionService.getSession();

    if (!session?.accessToken) {
      throw { status: 401, message: "Phiên đăng nhập đã hết hạn" };
    }

    await AuthService.logoutAllDevices(session.accessToken);
    setToken(null);
    setUser(null);
    await AuthSessionService.clearSession();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        loading,
        signIn,
        signInWithToken,
        signInWithRememberedAccount,
        signOut,
        logoutDeviceSession,
        logoutAllDevices,
      }}
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

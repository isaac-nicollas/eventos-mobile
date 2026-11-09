import * as SecureStore from "expo-secure-store";
import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, request } from "../lib/api";
import type { User } from "../types";

const TOKEN_KEY = "userToken";
const USER_KEY = "userData";

type AuthContextType = {
  token: string | null;
  user: User | null;
  isLoading: boolean; // true enquanto a sessão salva está sendo carregada
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  // fetch autenticado: envia o token e desloga automaticamente se a API responder 401
  apiFetch: <T>(path: string, options?: RequestInit) => Promise<T>;
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ao abrir o app, recupera a sessão salva (mantém o usuário autenticado)
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(USER_KEY);
        if (storedToken) {
          setToken(storedToken);
          setUser(storedUser ? (JSON.parse(storedUser) as User) : null);
        }
      } catch (error) {
        console.error("Erro ao carregar a sessão", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = useCallback(async (newToken: string, newUser: User) => {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const apiFetch = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      try {
        return await request<T>(path, { ...options, token });
      } catch (error) {
        // Token expirado ou inválido: encerra a sessão (as rotas protegidas redirecionam ao login)
        if (error instanceof ApiError && error.status === 401) await logout();
        throw error;
      }
    },
    [token, logout],
  );

  const value = useMemo(
    () => ({ token, user, isLoading, login, logout, apiFetch }),
    [token, user, isLoading, login, logout, apiFetch],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

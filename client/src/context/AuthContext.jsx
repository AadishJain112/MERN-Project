import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
  token: "cdstar_token",
  user: "cdstar_user",
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() =>
    localStorage.getItem(STORAGE_KEYS.token)
  );
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.user);
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(false);

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken) {
      localStorage.setItem(STORAGE_KEYS.token, nextToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.token);
    }

    if (nextUser) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, []);

  const login = useCallback(
    async (credentials) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/login", credentials);
        if (!data || !data.user) {
          const message = data?.message || "Invalid server response";
          throw new Error(message);
        }

        setToken(data.token || null);
        setUser(data.user);
        persist(data.token || null, data.user);
        return data.user;
      } catch (error) {
        const message = error.response?.data?.message || "Unable to login";
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const register = useCallback(
    async (userData) => {
      setLoading(true);
      try {
        const { data } = await api.post("/auth/self-register", userData);
        if (!data || !data.user) {
          const message = data?.message || "Invalid server response";
          throw new Error(message);
        }

        setToken(data.token || null);
        setUser(data.user);
        persist(data.token || null, data.user);
        return data.user;
      } catch (error) {
        const message = error.response?.data?.message || "Unable to register";
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [persist]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    persist(null, null);
  }, [persist]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token && user),
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return ctx;
};

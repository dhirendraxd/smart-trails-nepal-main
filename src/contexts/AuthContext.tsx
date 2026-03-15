import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  userName: string | null;
  login: (name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userName: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState<string | null>(() => {
    try { return localStorage.getItem("smartyatra_user"); } catch { return null; }
  });

  const login = useCallback((name: string) => {
    setUserName(name);
    localStorage.setItem("smartyatra_user", name);
  }, []);

  const logout = useCallback(() => {
    setUserName(null);
    localStorage.removeItem("smartyatra_user");
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!userName, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

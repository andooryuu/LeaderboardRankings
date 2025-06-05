import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  adminToken: string | null;
  login: (token: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// You can change this to a more secure token or implement server-side validation
const VALID_ADMIN_TOKEN = "blazepod-admin-2024-secure";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem("blazepod-admin-token");
    if (storedToken && storedToken === VALID_ADMIN_TOKEN) {
      setAdminToken(storedToken);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (token: string): boolean => {
    if (token === VALID_ADMIN_TOKEN) {
      setAdminToken(token);
      setIsAuthenticated(true);
      localStorage.setItem("blazepod-admin-token", token);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdminToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("blazepod-admin-token");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, adminToken, login, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean; // Add this line
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  requestVerificationCode: (email: string) => Promise<boolean>;
  verifyCode: (
    email: string,
    code: string
  ) => Promise<{
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add this line
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token on app load
    const savedToken = localStorage.getItem("adminToken");
    const savedUser = localStorage.getItem("adminUser");

    if (savedToken && savedUser) {
      // Verify token with server
      fetch(
        "https://leaderboardrankings-serveur.onrender.com/auth/verify-token",
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        }
      )
        .then((response) => {
          if (response.ok) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
          }
        })
        .catch(() => {
          // Network error, clear storage
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
        })
        .finally(() => {
          setIsLoading(false); // Add this line
        });
    } else {
      setIsLoading(false); // Add this line
    }
  }, []);

  const requestVerificationCode = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(
        "https://leaderboardrankings-serveur.onrender.com/auth/request-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Error requesting verification code:", error);
      return false;
    }
  };

  const verifyCode = async (email: string, code: string) => {
    try {
      const response = await fetch(
        "https://leaderboardrankings-serveur.onrender.com/auth/verify-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, code }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        return {
          success: true,
          token: data.token,
          user: data.user,
        };
      } else {
        return {
          success: false,
          error: data.error || "Verification failed",
        };
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      return {
        success: false,
        error: "Network error occurred",
      };
    }
  };

  const login = (token: string, user: User) => {
    setToken(token);
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        token,
        login,
        logout,
        requestVerificationCode,
        verifyCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

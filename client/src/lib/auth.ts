// Simple client-side auth for static deployment
// Note: This is not as secure as server-side auth but works for static sites
import { useState, createContext, useContext, useCallback } from "react";
import { SHA256 } from "crypto-js";

// This is a hash of the password, not the actual password
// Generated using SHA256("MyAmorcito8903++")
const ADMIN_PASSWORD_HASH = "4575cd6c2904b361c0625232305c921febc63d32400ddf03ec1e48422c4b52dc";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthProvider() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback((password: string) => {
    const hashedPassword = SHA256(password).toString();
    console.log('Attempting login with hash:', hashedPassword);
    if (hashedPassword === ADMIN_PASSWORD_HASH) {
      setIsAuthenticated(true);
      // Generate a simple auth token and store it
      const authToken = SHA256(Date.now().toString()).toString();
      sessionStorage.setItem('authToken', authToken);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    // Clear the auth token on logout
    sessionStorage.removeItem('authToken');
  }, []);

  return {
    isAuthenticated,
    login,
    logout,
  };
}
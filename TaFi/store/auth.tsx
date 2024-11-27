import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isLoggedIn: boolean;
  storeTokenInLS: (serverToken: string) => Promise<void>;
  LogoutUser: () => Promise<void>;
  user: any;
  services: any;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<any>(null); // Add services state

  const storeTokenInLS = async (serverToken: string) => {
    setToken(serverToken);
    await AsyncStorage.setItem("token", serverToken);
  };

  let isLoggedIn = !!token;

  const LogoutUser = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
  };

  const userAuthentication = async () => {
    if (!token) return;
    try {
      const response = await fetch("http://localhost:5000/api/auth/user", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.userData);
      }
    } catch (error) {
      console.log("Error Fetching the User data");
    }
  };

  const getServices = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data.services);
      }
    } catch (error) {
      console.log("Error fetching services");
    }
  };

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
      }
    };
    fetchToken();
  }, []);

  // useEffect(() => {
  //   userAuthentication();
  //   getServices();
  // }, [token]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, storeTokenInLS, LogoutUser, user, services }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const authContextValue = useContext(AuthContext);
  if (!authContextValue) {
    throw new Error("useAuth used outside of the Provider");
  }
  return authContextValue;
};

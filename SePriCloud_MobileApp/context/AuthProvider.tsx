import { ReactNode, createContext, useEffect } from "react";
import { useContext, useState } from "react";
import { router, useSegments } from "expo-router";

type User = {
    accessToken: any;
    user: any;
};

type AuthProvider = {
  user: User | null;
  updateUser: (user: User | null) => void;
  serverUrl: string;
  updateServerUrl: (serverUrl: string) => void;
  authPrefix: string;
  updateAuthPrefix: (authPrefix: string) => void;
  apiPrefix: string;
  updateApiPrefix: (apiPrefix: string) => void;
  apiKey: string;
  updateApiKey: (apiKey: string) => void;
};

export const AuthContext = createContext<AuthProvider>({
  user: null,
  updateUser: () => {},
  serverUrl: '',
  updateServerUrl: () => {},
  authPrefix: '',
  updateAuthPrefix: () => {},
  apiPrefix: '',
  updateApiPrefix: () => {},
  apiKey: '',
  updateApiKey: () => {},
});

export function useAuth() {
  if (!useContext(AuthContext)) {
    throw new Error("useAuth must be used within a <AuthProvider />");
  }

  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [serverUrl, setServerUrl] = useState<string>('');
  const [authPrefix, setAuthPrefix] = useState<string>('');
  const [apiPrefix, setApiPrefix] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');

  const updateUser = (updatedUser: User | null) => {
    setUser(updatedUser);
  }

  const updateServerUrl = (updatedUrl: string) => {
    setServerUrl(updatedUrl);
  }

  const updateAuthPrefix = (updatedAuthPrefix: string) => {
    setAuthPrefix(updatedAuthPrefix);
  }

  const updateApiPrefix = (updatedApiPrefix: string) => {
    setApiPrefix(updatedApiPrefix);
  }

  const updateApiKey = (updatedApiKey: string) => {
    setApiKey(updatedApiKey);
  }

  return (
    <AuthContext.Provider value={{
      user,
      updateUser,
      serverUrl,
      updateServerUrl,
      authPrefix,
      updateAuthPrefix,
      apiPrefix,
      updateApiPrefix,
      apiKey,
      updateApiKey
    }}>
      {children}
    </AuthContext.Provider>
  );
}

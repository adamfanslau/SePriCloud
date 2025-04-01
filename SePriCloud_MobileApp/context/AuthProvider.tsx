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
  apiPrefix: string;
};

export const AuthContext = createContext<AuthProvider>({
  user: null,
  updateUser: () => {},
  serverUrl: '',
  updateServerUrl: () => {},
  authPrefix: '',
  apiPrefix: '',
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

  const updateUser = (updatedUser: User | null) => {
    console.log('inside updateUser: ', updatedUser);
    setUser(updatedUser);
    console.log('after setUser: ', user);
  }

  const updateServerUrl = (updatedUrl: string) => {
    console.log('inside updateServerUrl: ', updatedUrl);
    setServerUrl(updatedUrl);
    setApiPrefix('sepricloud');
    setAuthPrefix('auth');
    console.log('after setServerUrl: ', serverUrl);
  }

  return (
    <AuthContext.Provider value={{ user, updateUser, serverUrl, updateServerUrl, authPrefix, apiPrefix }}>
      {children}
    </AuthContext.Provider>
  );
}

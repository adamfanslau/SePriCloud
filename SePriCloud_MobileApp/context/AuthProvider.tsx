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
};

export const AuthContext = createContext<AuthProvider>({
  user: null,
  updateUser: () => {},
});

export function useAuth() {
  if (!useContext(AuthContext)) {
    throw new Error("useAuth must be used within a <AuthProvider />");
  }

  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const updateUser = (updatedUser: User | null) => {
    console.log('inside updateUser: ', updatedUser);
    setUser(updatedUser);
    console.log('after setUser: ', user);
  }

  return (
    <AuthContext.Provider value={{ user, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

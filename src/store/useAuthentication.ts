import type { User } from "@/server/db/schema";
import { create } from "zustand";

interface AuthenticationStore {
  isAuthenticated: boolean;
  currentUser: User | null;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setCurrentUser: (user: User | null) => void;
}

export const useAuthentication = create<AuthenticationStore>((set) => ({
  isAuthenticated: false,
  currentUser: null,
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setCurrentUser: (user) => set({ currentUser: user }),
}));

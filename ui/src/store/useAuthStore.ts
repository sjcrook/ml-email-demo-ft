import { create } from "zustand";
import AuthStatus from "../entities/AuthStatus";

interface AuthStore {
    auth: AuthStatus | null;
    setAuth: (username: string) => void;
    clearAuth: () => void;
}

const useAuthStore = create<AuthStore>(set => ({
    auth: null,
    setAuth: (username) => set(() => ({ auth: { authenticated: true, username: username }})),
    clearAuth: () => set(() => ({ auth: { authenticated: false,  username: '' }}))
}));

export default useAuthStore;
import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import APIClient from '../services/api-client';

const useAuth = () => {
    console.log('Entered useAuth...');
    const { auth, setAuth, clearAuth } = useAuthStore();
    const [ pending, setPending ] = useState(false);
    const [ error, setError ] = useState(null);

    //useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                setPending(true);
                setError(null);
                const apiClient = new APIClient('/auth/status');
                const response = await apiClient.get();
                if (response.status !== 200) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                if (response.data.authenticated) {
                    setAuth(response.data.username);
                } else {
                    clearAuth();
                }
                setPending(false);
                return { success: true };
            } catch (err) {
                setPending(false);
                setError(err.message);
                return { success: false };
            }
        };

    //   checkAuthStatus();
    //}, []);

    const signIn = async (credentials) => {
        try {
            setPending(true);
            setError(null);
            const apiClient = new APIClient('/auth/in');
            const response = await apiClient.put(credentials);
            if (response.status !== 200) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            setAuth(credentials.username);
            setPending(false);
            return { success: true };
        } catch (err) {
            setPending(false);
            setError(err.message);
            return { success: false };
        }
    };

    const signOut = async () => {
        try {
            setPending(true);
            setError(null);
            const apiClient = new APIClient('/auth/out');
            const response = await apiClient.get();
            if (response.status !== 200) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            clearAuth();
            setPending(false);
            return { success: true };
        } catch (err) {
            setPending(false);
            setError(err.message);
            return { success: false };
        }
    };

  return { auth, checkAuthStatus ,signIn, signOut, pending, error };
};

export default useAuth;
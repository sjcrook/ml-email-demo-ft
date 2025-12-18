import { Outlet } from 'react-router-dom';
import NavigationDrawer from '../components/NavigationDrawer';
import { useEffect, useRef } from 'react';
import APIClient from '../services/api-client';
import { useAuthStore, useNotificationStore } from '../store';
import Notifications from '../components/Notifications';
import { APP_CONFIG } from '../local';

const Layout = () => {
    const { auth, setAuth, clearAuth } = useAuthStore();
    const addNotification = useNotificationStore(s => s.addNotification);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const apiClient = new APIClient('/auth/status');
                const response = await apiClient.get();
                if (response.status !== 200) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                if (response.data?.authenticated) {
                    setAuth(response.data.username);
                } else {
                    clearAuth();
                }
                return { success: true };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                addNotification({
                    style: 'error',
                    icon: true,
                    closable: true,
                    message: `Error retrieving authentication status: ${errorMessage}`,
                    timeout: APP_CONFIG.NOTIFICATION_TIMEOUT_LONG
                });   
                clearAuth(); 
            }
        };

        checkAuthStatus();
    }, [setAuth, clearAuth, addNotification]);

    if (auth === null) {
        return <Notifications/>;
    }
    
    return (
        <>
            <Notifications/>
            <NavigationDrawer>
                <Outlet/>
            </NavigationDrawer>
        </>
    );
};

export default Layout;
import { useCallback, useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from './authContextObject';

export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem('access_token'));
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(() => Boolean(localStorage.getItem('access_token')));

    useEffect(() => {
        let isMounted = true;

        const bootstrapAuth = async () => {
            if (!accessToken) {
                if (isMounted) {
                    setUser(null);
                    setIsLoadingAuth(false);
                }

                return;
            }

            try {
                const response = await axiosInstance.get('/me');

                if (isMounted) {
                    setUser(response.data ?? null);
                }
            } catch {
                localStorage.removeItem('access_token');

                if (isMounted) {
                    setAccessToken(null);
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingAuth(false);
                }
            }
        };

        bootstrapAuth();

        return () => {
            isMounted = false;
        };
    }, [accessToken]);

    const login = useCallback((token, userData = null) => {
        localStorage.setItem('access_token', token);
        setAccessToken(token);
        setUser(userData);
        setIsLoadingAuth(false);
    }, []);

    const logout = useCallback(async () => {
        try {
            if (accessToken) {
                await axiosInstance.post('/logout');
            }
        } catch {
            // Ignore API logout errors and clear local session anyway.
        }

        localStorage.removeItem('access_token');
        setAccessToken(null);
        setUser(null);
        setIsLoadingAuth(false);
    }, [accessToken]);

    const value = useMemo(
        () => ({
            accessToken,
            user,
            isAuthenticated: Boolean(accessToken),
            isLoadingAuth,
            login,
            logout,
            setUser,
        }),
        [accessToken, user, isLoadingAuth, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

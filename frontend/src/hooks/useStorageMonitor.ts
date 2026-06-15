import { useEffect, useRef } from 'react';
import { logout } from '../service/auth/AuthService';
import { useAuth } from '../context/AuthContext';

const ALLOWED_KEYS = ['token', 'role', 'user_id', 'username'];

let isLegitimateChange = false;

export const markStorageChangeLegitimate = (callback: () => void) => {
    isLegitimateChange = true;
    callback();
    setTimeout(() => {
        isLegitimateChange = false;
    }, 100);
};

export const useStorageMonitor = () => {
    const { setUser, user } = useAuth();
    const storageSnapshotRef = useRef<Map<string, string>>(new Map());
    const isMonitoringRef = useRef(false);

    useEffect(() => {
        if (user && !isMonitoringRef.current) {
            const snapshot = new Map<string, string>();
            ALLOWED_KEYS.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) snapshot.set(key, value);
            });
            storageSnapshotRef.current = snapshot;
            isMonitoringRef.current = true;
        } else if (!user) {
            isMonitoringRef.current = false;
        }
    }, [user]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (isLegitimateChange) return;

            if (!user) return;

            if (ALLOWED_KEYS.includes(e.key!) && e.newValue === null) {
                performLogout();
                return;
            }

            if (ALLOWED_KEYS.includes(e.key!) && e.newValue !== null) {
                const expectedValue = storageSnapshotRef.current.get(e.key!);
                if (expectedValue && e.newValue !== expectedValue) {
                    performLogout();
                }
            }
        };

        const intervalId = setInterval(() => {
            if (isLegitimateChange) return;

            if (!user || !isMonitoringRef.current) return;

            let hasUnauthorizedChange = false;

            ALLOWED_KEYS.forEach(key => {
                const currentValue = localStorage.getItem(key);
                const expectedValue = storageSnapshotRef.current.get(key);

                if (expectedValue && !currentValue) {
                    hasUnauthorizedChange = true;
                }

                if (expectedValue && currentValue && currentValue !== expectedValue) {
                    hasUnauthorizedChange = true;
                }
            });

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && !ALLOWED_KEYS.includes(key)) {
                    hasUnauthorizedChange = true;
                }
            }

            if (hasUnauthorizedChange) {
                performLogout();
            }
        }, 1000);

        const performLogout = () => {
            markStorageChangeLegitimate(() => {
                logout().finally(() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    setUser(null);
                    isMonitoringRef.current = false;
                });
            });
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(intervalId);
        };
    }, [setUser, user]);
};
import { createContext, useContext, useEffect, useState } from "react";
import type { IChildren } from "../types/ChildrenProps";
import type { TAuthContextType } from "../types/AuthContextType";

const AuthContext = createContext({} as TAuthContextType);

export const AuthProvider: React.FC<IChildren> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const role = localStorage.getItem('role') || sessionStorage.getItem('role');
        const user_id = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
        const username = localStorage.getItem('username') || sessionStorage.getItem('username');

        if (token && role) {
            const userData = { 
                token, 
                role, 
                user_id: user_id || undefined,
                username: username || undefined
            };
            setUser(userData);
        } else {
            setUser(null);
        }

        setLoading(false);
    };

    useEffect(() => {
        checkAuth();

        window.addEventListener('storage', checkAuth);

        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

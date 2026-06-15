import type { TRoles } from "./Roles";

export type TAuthContextType = {
    user: {
        token: string;
        role: TRoles;
        user_id?: string;
        username?: string;
    } | null;
    setUser: (user: any) => void;
    loading?: boolean
    checkAuth: () => void
}
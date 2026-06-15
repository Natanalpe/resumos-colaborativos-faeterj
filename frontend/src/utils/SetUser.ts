export const useSetUser = () => {
    const setUser = (token: string, role: string, keepLogged: boolean, user_id?: string, username?: string) => {
        if (keepLogged) {
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            if (user_id) localStorage.setItem('user_id', user_id);
            if (username) localStorage.setItem('username', username);
        } else {
            sessionStorage.setItem('token', token);
            sessionStorage.setItem('role', role);
            if (user_id) sessionStorage.setItem('user_id', user_id);
            if (username) sessionStorage.setItem('username', username);
        }
    }

    return { setUser };
}

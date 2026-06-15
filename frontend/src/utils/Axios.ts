import type { AxiosError, AxiosInstance } from "axios";
import axios from "axios";
import { redirectTo } from "./Navigation";
import type { TDefaultMessages } from "../types/DefaultMessagesType";

export function authRequestAxios(): AxiosInstance {
    return axios.create({
        baseURL: import.meta.env.VITE_BACKEND_AUTH_ENDPOINT,
        timeout: 15000,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
}

export function requestAxios(): AxiosInstance {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const instance = axios.create({
        baseURL: import.meta.env.VITE_BACKEND_ENDPOINT,
        timeout: 15000,
        headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
        }
    });

    instance.interceptors.response.use(
        response => response,
        (error: AxiosError) => {
            if (error.response?.status === 403) {
                const responseData = error.response.data as any;

                if (responseData.errors?.includes("REG_EMAIL") ||
                    responseData.message === "É necessário cadastrar um email") {

                    if (!window.location.pathname.includes('registeremail')) {
                        redirectTo('registeremail');
                    }
                    return Promise.reject(error);
                }

                if (responseData.errors?.includes("CHG_PSW") ||
                    (responseData.message as TDefaultMessages) === "É preciso alterar a senha") {

                    if (!window.location.pathname.includes('primeiroacesso')) {
                        redirectTo('primeiroacesso');
                    }
                    return Promise.reject(error);
                }
            }

            if (error.response?.status === 503) {
                const responseData = error.response.data as any;
                if (responseData.errors?.includes("MNT_MDE") ||
                    (responseData.message as TDefaultMessages) === 'Em manutenção') {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                }
            }

            const messages_unauth = ['Unauthenticated.', 'Unauthorized.'];
            if (error.response?.status === 401) {
                const responseData = error.response.data as any;
                if (messages_unauth.find(message => message === responseData.message) &&
                    !window.location.pathname.includes('/login')) {

                    const currentPath = window.location.pathname + window.location.search;
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
                }
            }

            return Promise.reject(error);
        }
    );

    return instance;
}
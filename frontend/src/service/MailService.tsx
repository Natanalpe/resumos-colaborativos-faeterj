import { requestAxios, authRequestAxios } from "../utils/Axios";

export interface IRequestPasswordChangeData {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

const BASE_PASS_URL = 'password';

export function sendResetPasswordMail(email: string) {
    return requestAxios()
        .post(`${BASE_PASS_URL}/send-reset-mail`, { email });
}

export function validateMailToken(token: string) {
    return requestAxios()
        .post(`${BASE_PASS_URL}/validate-token`, { token });
}

export function setPassword(token: string, password: string, password_confirmation: string) {
    return requestAxios()
        .post(`${BASE_PASS_URL}/set-password`, {
            token,
            password,
            password_confirmation
        });
}


export function requestPasswordChange(data: IRequestPasswordChangeData) {
    return requestAxios()
        .post('request-password-change', data);
}

export function confirmPasswordChange(token: string) {
    return authRequestAxios()
        .post('confirm-password-change', { token });
}


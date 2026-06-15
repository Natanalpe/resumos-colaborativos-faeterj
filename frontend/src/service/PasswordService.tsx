import { authRequestAxios } from "../utils/Axios";

export function validateRecoveryToken(token: string) {
    return authRequestAxios()
        .post('password/validate-token', { token });
}

export function resetPassword(token: string, password: string, password_confirmation: string) {
    return authRequestAxios()
        .post('password/reset', {
            token,
            password,
            password_confirmation
        });
}

export function sendRecoveryPasswordMail(email: string) {
    return authRequestAxios()
        .post('password/recovery', { email });
}

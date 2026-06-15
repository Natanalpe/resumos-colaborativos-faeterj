import { authRequestAxios, requestAxios } from "../../utils/Axios"

interface ILoginForm {
    matricula: string,
    password: string,
    keepLogged?: boolean
}

export function loginService(data: ILoginForm) {
    return authRequestAxios()
        .post('login', data);
}

export function logout() {
    return requestAxios()
        .post('logout');
}
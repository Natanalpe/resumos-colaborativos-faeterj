import { requestAxios } from "../utils/Axios";

const BASE_URL_USER_WARNINGS = "users";
const BASE_URL_WARNINGS = "warnings";

export function getWarningsByUserId(id: string, page: number) {
    return requestAxios()
        .get(`${BASE_URL_USER_WARNINGS}/${id}/warnings`, {
            params: {
                page: page
            }
        })
}

export function createWarning(data: any) {
    return requestAxios()
        .post(`${BASE_URL_WARNINGS}`, data);
}

export function deleteWarning(id: string) {
    return requestAxios()
        .delete(`${BASE_URL_WARNINGS}/${id}`);
}

export function getUserWarningsCount(userId: string) {
    return requestAxios()
        .get(`${BASE_URL_USER_WARNINGS}/${userId}/count/${BASE_URL_WARNINGS}`);
}
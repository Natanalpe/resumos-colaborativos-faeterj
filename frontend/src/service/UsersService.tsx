import type { TRoles } from "../types/Roles";
import type { TSubjectTypes } from "../types/Subjects";
import { requestAxios } from "../utils/Axios";

const BASE_URL_USERS = "users";

export function getAllByRole(role: TRoles) {
    return requestAxios()
        .get(`${BASE_URL_USERS}/role`, {
            params: {
                role: role
            }
        });
}

export function getAllUsers(page: number = 1) {
    return requestAxios()
        .get(`${BASE_URL_USERS}`, {
            params: {
                page: page
            }
        });
}

export function searchUsers(queryTerm: string, page: number, role: string, canPost: boolean, isActive: boolean) {
    return requestAxios()
        .get(`${BASE_URL_USERS}/search`, {
            params: {
                page: page,
                q: queryTerm,
                role: role,
                canPost: canPost,
                isActive: isActive
            }
        });
}

export function getUserById(id: string) {
    return requestAxios()
        .get(`${BASE_URL_USERS}/` + id);
}

export function updateUserStudent(data: any, id: string) {
    return requestAxios()
        .put(`${BASE_URL_USERS}/` + id, data);
}

export function disableUser(data: any, id: string | undefined) {
    return requestAxios()
        .put(`${BASE_URL_USERS}/disable/` + id, data);
}

export function enableUser(data: any, id: string | undefined) {
    return requestAxios()
        .put(`${BASE_URL_USERS}/enable/` + id, data);
}

export function createUsers(data: any) {
    return requestAxios()
        .post(`${BASE_URL_USERS}`, data);
}

export function getAllTeachersSimple() {
    return requestAxios()
        .get(`${BASE_URL_USERS}/teacher/all`);
}

export function getUserProfile(user_id: string) {
    return requestAxios()
        .get(`${BASE_URL_USERS}/profile/${user_id}`);
}

export function getUserPosts(
    userId: string,
    page: number = 1,
    search?: string,
    subject?: string,
    type?: TSubjectTypes | '*',
    teacher?: string
) {
    return requestAxios()
        .get(`${BASE_URL_USERS}/profile/posts/${userId}`, {
            params: {
                page: page,
                q: search || '',
                materia: subject || '',
                tipo: type || '*',
                professor: teacher || ''
            }
        });
}

export function disableUsers(data: { usuarios: string[], razao_da_desativacao?: string }) {
    return requestAxios()
        .post(`${BASE_URL_USERS}/bunch/disable`, data);
}

export function reactivateUsers(data: { usuarios: string[] }) {
    return requestAxios()
        .post(`${BASE_URL_USERS}/bunch/enable`, data);
}
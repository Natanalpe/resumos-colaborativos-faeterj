import type { TSubjectPropsData } from "../pages/configurations/Subjects/EditModal";
import { requestAxios } from "../utils/Axios";

const BASE_URL_SUBJECT = "subjects"

export function getAllSubjects(page: number = 1) {
    return requestAxios()
        .get(BASE_URL_SUBJECT, {
            params: {
                page: page
            }
        });
}

export function getSubjects() {
    return requestAxios()
        .get(BASE_URL_SUBJECT);
}

export function getByIdSubject(id: string) {
    return requestAxios()
        .get(`${BASE_URL_SUBJECT}/${id}`)
}

export function updateSubject(id: string | undefined, data: Omit<TSubjectPropsData, 'id'>) {
    return requestAxios()
        .put(`${BASE_URL_SUBJECT}/${id}`, data)
}

export function deleteSubject(id?: string) {
    return requestAxios()
        .delete(`${BASE_URL_SUBJECT}/${id}`);
}

export function createSubject(data: Omit<TSubjectPropsData, 'id'>) {
    return requestAxios()
        .post(`${BASE_URL_SUBJECT}`, data);
}

export function searchSubjects(queryTerm: string, page: number) {
    return requestAxios()
        .get(`${BASE_URL_SUBJECT}/search`, {
            params: {
                page: page,
                q: queryTerm
            }
        });
}
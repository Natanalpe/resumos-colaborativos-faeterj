import type { TSubjectTypes } from "../types/Subjects";
import { requestAxios } from "../utils/Axios";

const BASE_URL_SUMMARIES = "summaries";

export function searchSummary(queryTerm: string, page: number, subject_id: string, type: TSubjectTypes | '*', teacher_id: string) {
    return requestAxios()
        .get(`${BASE_URL_SUMMARIES}/search`, {
            params: {
                q: queryTerm,
                page: page,
                professor: teacher_id,
                tipo: type,
                materia: subject_id
            }
        });
}

export function getSummaryById(id: any, allowDeleted: number = 0) {
    return requestAxios()
        .get(`${BASE_URL_SUMMARIES}/${id}`, {
            params: {
                allowDeleted: allowDeleted
            }
        });
}

export function getLastSummaries(quantity: number) {
    return requestAxios()
        .get(`${BASE_URL_SUMMARIES}/last`, {
            params: {
                quantity: quantity
            }
        })
}

export function getDeletedSummaries(queryTerm: string, page: number, subject_id: string, type: TSubjectTypes | '*', teacher_id: string) {
    return requestAxios()
        .get(`${BASE_URL_SUMMARIES}/deleted/all`, {
            params: {
                q: queryTerm,
                page: page,
                professor: teacher_id,
                tipo: type,
                materia: subject_id
            }
        });
}

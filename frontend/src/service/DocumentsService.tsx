import { requestAxios } from "../utils/Axios";

const BASE_URL_DOCUMENT = 'summaries'

export function getByIdDocument(id: string) {
    return requestAxios()
        .get(`${BASE_URL_DOCUMENT}/${id}`);
}

export function createDocument(data: any) {
    return requestAxios()
        .post(BASE_URL_DOCUMENT, data);
}

export function getImageByDocumentId(id: string): Promise<Blob> {
    return requestAxios()
        .get(`${BASE_URL_DOCUMENT}/${id}/image`, {
            responseType: 'blob'
        })
        .then(response => response.data);
}

export function deleteContentDocument(id: string) {
    return requestAxios()
        .delete(`${BASE_URL_DOCUMENT}/${id}`);
}

export function restoreSummary(id: string) {
    return requestAxios()
        .put(`${BASE_URL_DOCUMENT}/restore/${id}`);
}

export function admDeleteContent(id: string) {
    return requestAxios()
        .delete(`${BASE_URL_DOCUMENT}/delete/${id}`);
}
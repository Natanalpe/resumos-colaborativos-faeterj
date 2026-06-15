import type { TSubjectTypes } from "../types/Subjects";
import { requestAxios } from "../utils/Axios";

const BASE_URL_COLLECTION_DOCUMENT = 'collection/document'

export function addDocumentToCollection(document_id: string, collection_id: string | null) {
    return requestAxios()
        .post(`${BASE_URL_COLLECTION_DOCUMENT}`, {
            documento_id: document_id,
            colecao_id: collection_id
        });
}

export function removeDocumentFromCollection(document_id: string, collection_id: string | null) {
    console.log("DOCUEMNTO SERVICE ID", document_id);
    return requestAxios()
        .delete(`${BASE_URL_COLLECTION_DOCUMENT}`, {
            data: {
                documento_id: document_id,
                colecao_id: collection_id
            }
        });
}

export function checkDocumentInCollections(document_id: string) {
    return requestAxios()
        .get(`${BASE_URL_COLLECTION_DOCUMENT}/check/${document_id}`);
}

export function getDocumentsFromCollectionById(collection_id: string, queryTerm: string, page: number, subject_id: string, type: TSubjectTypes | '*', teacher_id: string) {
    return requestAxios()
        .get(`${BASE_URL_COLLECTION_DOCUMENT}/all/${collection_id}`, {
            params: {
                q: queryTerm,
                page: page,
                professor: teacher_id,
                tipo: type,
                materia: subject_id
            }
        });
}

export function getAllDocumentCollection(queryTerm: string, page: number, subject_id: string, type: TSubjectTypes | '*', teacher_id: string, user_id: string) {
    return requestAxios()
        .get(`${BASE_URL_COLLECTION_DOCUMENT}/all/user/${user_id}`, {
            params: {
                q: queryTerm,
                page: page,
                professor: teacher_id,
                tipo: type,
                materia: subject_id
            }
        });
}

export function updateDocumentsOrder(collectionId: string | null, documentsOrder: { documento_id: string, ordem: number }[]) {
    return requestAxios()
        .put(`${BASE_URL_COLLECTION_DOCUMENT}/update-order`, {
            colecao_id: collectionId,
            documents: documentsOrder
        });
}
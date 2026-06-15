import { requestAxios } from "../utils/Axios";

const BASE_URL_COLLECTION = 'collection';

export function createCollection(data: { nome: string }) {
    return requestAxios()
        .post(`${BASE_URL_COLLECTION}`, data);
}

export function getUserCollections(user_id: string, page: number = 1, pageable = true) {
    return requestAxios()
        .get(`${BASE_URL_COLLECTION}/user/${user_id}`, {
            params: {
                page: page,
                pageable: pageable
            }
        });
}

export function deleteCollection(collection_id: string) {
    return requestAxios()
        .delete(`${BASE_URL_COLLECTION}/${collection_id}`);
}

export function getCollectionById(collection_id: string) {
    return requestAxios()
        .get(`${BASE_URL_COLLECTION}/${collection_id}`);
}

export function editCollectionName(collection_id: string, nome: string) {
    return requestAxios()
        .put(`${BASE_URL_COLLECTION}/${collection_id}`, {
            nome: nome
        });
}


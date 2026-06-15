import { requestAxios } from "../utils/Axios";

const BASE_URL_REVIEW = 'review';

export function createOrUpdateReview(review: 'perfeito' | 'util' | 'confuso' | 'none', document_id: string) {
    return requestAxios()
        .post(`${BASE_URL_REVIEW}/summary/${document_id}`, { review });
}

export function deleteReview(document_id: string) {
    return requestAxios()
        .delete(`${BASE_URL_REVIEW}/summary/${document_id}`);
}
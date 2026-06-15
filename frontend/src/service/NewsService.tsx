import type { TNewsPropsData } from "../pages/configurations/News/EditModal";
import { requestAxios } from "../utils/Axios";

const BASE_URL_NEWS = "news";

export function getAllNews(pageUrl: string = "", page: number = 1) {
    if (page == 1) {
        return requestAxios()
            .get(pageUrl ? pageUrl : "news");
    }
    return requestAxios()
        .get(pageUrl ? pageUrl : "news", {
            params: {
                page: page
            }
        });
}

export function deleteNews(id?: string) {
    return requestAxios()
        .delete(`${BASE_URL_NEWS}/${id}`);
}

export function updateNews(id: string | undefined, data: Omit<TNewsPropsData, 'id' | 'user_id' | 'created_at'>) {
    return requestAxios()
        .put(`${BASE_URL_NEWS}/${id}`, data);
}

export function createNews(data: Omit<TNewsPropsData, 'id' | 'user_id' | 'created_at'>) {
    return requestAxios()
        .post(`${BASE_URL_NEWS}`, data);
}

export function searchNews(queryTerm: string, page: number, isDate: boolean | undefined) {
    return requestAxios()
        .get(`${BASE_URL_NEWS}/search`, {
            params: {
                page: page,
                q: queryTerm,
                isDate: isDate
            }
        });
}
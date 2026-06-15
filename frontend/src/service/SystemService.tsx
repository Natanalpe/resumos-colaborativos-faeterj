import { requestAxios } from "../utils/Axios";

const BASE_URL_SYSTEM = 'system';

export function getRules() {
    return requestAxios()
        .get(`${BASE_URL_SYSTEM}/rules`);
}

export function createOrUpdateRules(data: any) {
    return requestAxios()
        .post(`${BASE_URL_SYSTEM}/rules`, {
            rules: data
        });
}

export function getMaintenanceMode() {
    return requestAxios()
        .get(`${BASE_URL_SYSTEM}/maintenance`)
}

export function updateMaintenanceMode(is_under_maintenance: boolean, estimate_end: string) {
    return requestAxios()
        .put(`${BASE_URL_SYSTEM}/maintenance`, {
            under_maintenance: is_under_maintenance,
            estimate : estimate_end
        });
}

export function getMetrics() {
    return requestAxios()
        .get(`${BASE_URL_SYSTEM}/metrics`);
}
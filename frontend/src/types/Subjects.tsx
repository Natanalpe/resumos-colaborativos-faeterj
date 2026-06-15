import type { HttpStatusCode } from "axios";
import type { ApiResponse } from "./ApiResponseType";
import type { TDefaultMessages } from "./DefaultMessagesType";
import type { TUser } from "./UserType";

export type TSubject = {
    id: string,
    sigla: string,
    professor_id?: string,
    nome: string;
    professor?: Omit<TUser, 'role' | 'email'>
    professores?: any[]
};

export type SubjectsResponse = ApiResponse<{
    current_page: number,
    data: TSubject[],
    first_page_url: string,
    from: number,
    last_page: number,
    last_page_url: string,
    next_page_url: string,
    path: string,
    per_page: number,
    prev_page_url: string,
    to: number,
    total: number
}>;

export type TSubjectsResponsePageable = {
    data: {
        current_page: number;
        data: TSubject[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
    message: TDefaultMessages;
    status: HttpStatusCode;
};

export type TSubjectsDashboard = {
    id: string;
    sigla: string;
    nome: string;
    professores: { id: string; nomeCompleto: string }[];
};

export type TAllSubjectsResponse = ApiResponse<TSubject[]>;

export type TSubjectTypes = 'p1' | 'p2' | 'p3' | 'pf' | 'outros';
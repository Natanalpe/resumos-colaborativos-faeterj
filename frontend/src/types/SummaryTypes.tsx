import type { ApiResponse } from "./ApiResponseType";
import type { TRoles } from "./Roles";
import type { TSubjectsDashboard, TSubjectTypes } from "./Subjects";
import type { TUser } from "./UserType";

export type TResponseSummary = ApiResponse<TSummaryProfile>;
export type TResponseProfileSummary = ApiResponse<TSummaryProfile[]>;

export type TSummaryProfile = {
    id: string;
    materia_id: string;
    titulo: string;
    created_at: string;
    updated_at: string;
    conteudo_texto: string | null;
    user_id: string;
    tipo: TTypesSummary;
    tag: TSubjectTypes;
    apagado: 1 | 0;
    subject: {
        id: string;
        nome: string;
        sigla: string;
        professores: Array<{
            id: string;
            nome: string;
            sobrenome: string;
            pivot?: {
                materia_id: string;
                professor_id: string;
            };
        }>;
    };
    materia: {
        id: string;
        nome: string;
        sigla: string;
        professores: Array<{
            id: string;
            nome: string;
            sobrenome: string;
            pivot?: {
                materia_id: string;
                professor_id: string;
            };
        }>;
    };
    owner: {
        id: string;
        nome: string;
        sobrenome: string;
        role: TRoles;
    };
    user: {
        id: string;
        nome: string;
        sobrenome: string;
        role: TRoles;
    };
    util_count?: number;
    perfeito_count?: number;
    confuso_count?: number;
    reviews?: Array<{
        id: string;
        documento_id: string;
        review: 'perfeito' | 'util' | 'confuso';
    }>;
};

export type TSummary = {
    id: string,
    apagado: boolean,
    conteudo_texto: string,
    created_at: string,
    tag: TSubjectTypes,
    tipo: TTypesSummary,
    titulo: string,
    materia: Omit<TSubjectsDashboard, 'professores'>,
    user: Omit<TUser, 'email' | 'ativo' | 'pode_postar' | 'matricula'>
};

export type TTypesSummary = 'imagem' | 'txt' | 'readme' | 'youtube_link';
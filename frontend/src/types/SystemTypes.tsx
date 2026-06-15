import type { ApiResponse } from "./ApiResponseType";

export type TResponseMetrics = ApiResponse<TMetrics>;

export type TMetrics = {
    id?: string,
    counts: any,
    administradores: number,
    alunos: number,
    professores: number,
    resumo_por_materia: TQntSummaryBySubject[]
};

export type TQntSummaryBySubject = {
    id: string,
    nome: string,
    total_documentos: number,
    sigla: string,
};
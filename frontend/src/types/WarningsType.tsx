import type { TUser } from "./UserType";

export type TWarningsActions = 'multiplas_tentativas_de_upload' | 'upload_de_virus' | 'upload_de_conteudo_sensivel' | 'outro';

export type TWarnings = {
    id: string,
    user_id: string,
    documento_id: string,
    acao: TWarningsActions,
    created_at: string,
    updated_at: string | null,
    foi_visto: boolean,
    descricao: string | null,
    student: Omit<TUser, 'role' | 'email' | 'ativo' | 'pode_postar'>
};
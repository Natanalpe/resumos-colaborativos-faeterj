import type { ApiResponse } from "./ApiResponseType"
import type { TRoles } from "./Roles"
import type { TWarningsActions } from "./WarningsType"

export type TUser = {
    id: string,
    nome: string,
    sobrenome: string,
    role: TRoles,
    email?: string,
    ativo?: boolean,
    pode_postar?: boolean,
    matricula?: string
}

export type TUserDashboard = {
    id: string,
    nome: string,
    sobrenome?: string,
    role: TRoles,
    ativo: boolean,
    pode_postar: boolean
}

export type TUserWarnings = {
    user: TUser,
    warnings: TWarningsActions
}

export type TUserProfile = {
    user: {
        id: string,
        nome: string,
        sobrenome: string,
        role: TRoles
    },
    count_posts: {
        count: number
    },
    review: {
        perfeito: number,
        util: number,
        confuso: number
    }
}

export type TUserProfileResponse = ApiResponse<TUserProfile>;
export type TSimpleUser = Pick<TUser, 'id' | 'nome' | 'sobrenome'>;
export type UsersTeacherResponse = ApiResponse<TSimpleUser[]>;
export type TsingleUserResponse = ApiResponse<TUser>;
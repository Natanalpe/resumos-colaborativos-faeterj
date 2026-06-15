import type { TUser } from "./UserType"
import type { ApiResponse } from "./ApiResponseType"
import type { TDefaultMessages } from "./DefaultMessagesType"
import type { HttpStatusCode } from "axios"

export type TNews = {
    created_at: Date | string,
    titulo: string,
    conteudo: string,
    id: string,
    user: Omit<TUser, 'role' | 'email'>,
    user_id: string
}

export type NewsResponse = ApiResponse<{
    current_page: number,
    data: TNews[],
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
}>

export type TNewsResponsePageable = {
  data: {
    current_page: number;
    data: TNews[];
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
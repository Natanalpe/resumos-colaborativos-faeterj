import type { AxiosResponse, HttpStatusCode } from "axios";
import type { TDefaultMessages } from "./DefaultMessagesType";

export type ApiResponse<T> = AxiosResponse<{
  data: T;
  message: TDefaultMessages;
  status: HttpStatusCode;
}>;
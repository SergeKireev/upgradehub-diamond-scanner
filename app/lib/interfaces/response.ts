export const STATUS_NOK = "nok";
export const STATUS_OK = "ok";

export type Status = "ok" | "nok";

export interface Response {
  status: Status;
}

export interface ErrorResponse extends Response {
  status: "nok";
  msg: string;
}

export interface OkResponse<T> extends Response {
  status: "ok";
  data: T;
}

export function isErrorResponse(r: Response): r is ErrorResponse {
  return r.status === STATUS_NOK;
}

export function isOkResponse<T>(r: Response): r is OkResponse<T> {
  return r.status === STATUS_OK;
}

import { Observable } from "rxjs";

interface RequestOptions {
  method?: string;
  body?: any;
  headers?: object;
  responseType?: string;
  timeout?: number;
}

export interface RequestResponse<T> {
  code: number;
  message: string;
  response: T;
}

export function request<T>(
  url: string,
  options?: RequestOptions
): Observable<RequestResponse<T>>;
export function stream<T>(url: string, options?: RequestOptions): Observable<T>;

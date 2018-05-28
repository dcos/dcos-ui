import { Observable } from "rxjs";

interface RequestOptions {
  method?: string
  body?: any
  headers?: Object
  responseType?: string
  timeout?: number
}

export function request<T>(url: string, options?: RequestOptions): Observable<T>;
export function stream<T>(url: string, options?: RequestOptions): Observable<T>;


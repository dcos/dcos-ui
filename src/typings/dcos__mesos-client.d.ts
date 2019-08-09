import { Observable } from "rxjs";

export function request(body: any, url?: string): Observable<string>;

export function stream<T>(body: any, url?: string): Observable<T>;

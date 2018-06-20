declare module "data-service" {
  import { Observable } from "rxjs/observable";
  export { componentFromStream, createEventHandler } from "recompose";

  export function graphqlObservable(
    doc: object,
    schema: object,
    context: object
  ): Observable<any>;
}

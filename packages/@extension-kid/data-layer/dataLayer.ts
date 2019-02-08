import { graphqlObservable } from "@dcos/data-service";
import { makeExecutableSchema, IResolvers } from "graphql-tools";
import { of, Observable, BehaviorSubject } from "rxjs";
import { switchMap, catchError } from "rxjs/operators";
import { injectable, inject, named } from "inversify";
import { ExtensionProvider } from "@extension-kid/core";
import { GraphQLSchema } from "graphql";

export const DataLayerExtensionType = Symbol("DataLayerExtension");
export const DataLayerType = Symbol("DataLayer");
export interface DataLayerExtensionInterface {
  id: symbol;
  getTypeDefinitions(enabledSchemas: symbol[]): string;
  getResolvers(enabledSchemas: symbol[]): IResolvers;
}

const baseQuery = `
type Query {
  isPresent: Boolean
}

type Mutation {
  noOpMutation(input: String): Boolean
}
`;

@injectable()
export default class DataLayer {
  extensionType = DataLayerExtensionType;

  _extensionProvider: ExtensionProvider<DataLayerExtensionInterface>;
  _schema$: BehaviorSubject<GraphQLSchema>;

  constructor(
    @inject(ExtensionProvider)
    @named(DataLayerExtensionType)
    extensionProvider: ExtensionProvider<DataLayerExtensionInterface>
  ) {
    this._extensionProvider = extensionProvider;
    this._schema$ = new BehaviorSubject(this.getExecutableSchema());

    this._extensionProvider.subscribe({
      next: () => this._schema$.next(this.getExecutableSchema())
    });
  }

  getExecutableSchema(): GraphQLSchema {
    const extensions = this._extensionProvider.getAllExtensions();
    const enabledIds = extensions.map(extension => extension.id);
    const typeDefs = [
      baseQuery,
      ...extensions.map(extension => extension.getTypeDefinitions(enabledIds))
    ];

    const resolvers = extensions.map(extension =>
      extension.getResolvers(enabledIds)
    );

    return makeExecutableSchema({ typeDefs, resolvers });
  }

  query(doc: any, context?: any): Observable<any> {
    return this._schema$.pipe(
      switchMap(schema =>
        graphqlObservable(doc, schema, context).pipe(
          catchError((err: string) =>
            of({
              data: {},
              errors: [{ message: "There was a GraphQL error: " + err }]
            })
          )
        )
      )
    );
  }
}

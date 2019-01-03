import { graphqlObservable } from "data-service";
import { makeExecutableSchema, IResolvers } from "graphql-tools";
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { injectable, inject, named } from "inversify";
import { ExtensionProvider } from "extension-kid";
import { GraphQLSchema } from "graphql";

export const DataLayerExtensionSymbol = Symbol("DataLayerExtension");
export const DataLayerSymbol = Symbol("DataLayer");
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
  _extensionProvider: ExtensionProvider<DataLayerExtensionInterface>;
  _schema$: BehaviorSubject<GraphQLSchema>;

  constructor(
    @inject(ExtensionProvider)
    @named(DataLayerExtensionSymbol)
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
    return this._schema$.switchMap(schema =>
      graphqlObservable(doc, schema, context).catch(err =>
        Observable.of({
          data: {},
          errors: [{ message: "There was a GraphQL error: " + err }]
        })
      )
    );
  }
}

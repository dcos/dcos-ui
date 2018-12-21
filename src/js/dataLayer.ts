import { graphqlObservable } from "data-service";
import { makeExecutableSchema, IResolvers } from "graphql-tools";
import { Observable } from "rxjs/Observable";
import { injectable, inject, named } from "inversify";
import { ExtensionProvider } from "extension-kid";
import { GraphQLSchema } from "graphql";

export const DataLayerExtension = Symbol("DataLayerExtension");

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
  _schema: GraphQLSchema;

  constructor(
    @inject(ExtensionProvider)
    @named(DataLayerExtension)
    extensionProvider: ExtensionProvider<DataLayerExtensionInterface>
  ) {
    this._extensionProvider = extensionProvider;
    this._extensionProvider.subscribe({ next: this.updateSchema.bind(this) });
    this._schema = this.getExecutableSchema();
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

  updateSchema() {
    this._schema = this.getExecutableSchema();
  }

  query(doc: any, context?: any): Observable<any> {
    return graphqlObservable(doc, this._schema, context);
  }
}

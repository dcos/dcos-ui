import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/throw";
import "rxjs/add/observable/of";
import "rxjs/add/operator/combineLatest";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";
import "rxjs/add/operator/concatMap";
import {
  DefinitionNode,
  DocumentNode,
  getNamedType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
  SelectionNode,
  FieldNode,
  GraphQLField
} from "graphql";

// WARNING: This is NOT a spec complete graphql implementation
// https://facebook.github.io/graphql/October2016/

interface TypeMap {
  [key: string]: GraphQLType;
}

interface Schema extends GraphQLSchema {
  _typeMap: TypeMap;
}

interface OperationNode {
  operation: "query" | "mutation";
}

type SchemaNode = SelectionNode | DefinitionNode;

function isOperationDefinition(node: any): node is OperationNode {
  return node.kind === "OperationDefinition";
}
function isFieldNode(node: SchemaNode): node is FieldNode {
  return node.kind === "Field";
}

function isDefinitionNode(node: SchemaNode): node is DefinitionNode {
  return (
    node.kind === "SchemaDefinition" ||
    node.kind === "ScalarTypeDefinition" ||
    node.kind === "ObjectTypeDefinition" ||
    node.kind === "InterfaceTypeDefinition" ||
    node.kind === "UnionTypeDefinition" ||
    node.kind === "EnumTypeDefinition" ||
    node.kind === "InputObjectTypeDefinition" ||
    node.kind === "ScalarTypeExtension" ||
    node.kind === "ObjectTypeExtension" ||
    node.kind === "InterfaceTypeExtension" ||
    node.kind === "UnionTypeExtension" ||
    node.kind === "EnumTypeExtension" ||
    node.kind === "InputObjectTypeExtension" ||
    node.kind === "DirectiveDefinition"
  );
}

export function graphqlObservable<T = object>(
  doc: DocumentNode,
  schema: Schema,
  context: object
): Observable<{ data: T }> {
  if (doc.definitions.length !== 1) {
    return throwObservable("document root must have a single definition");
  }
  const types = schema._typeMap;

  return resolve(doc.definitions[0], context, null, null).map((data: T) => ({
    data
  }));

  function resolve(
    definition: SchemaNode,
    context: object,
    parent: any,
    type: GraphQLType | null
  ) {
    if (isOperationDefinition(definition)) {
      const nextType = getResultType(type, definition, parent);

      return resolveResult(definition, context, null, nextType);
    }

    // The definition gives us the field to resolve
    if (isFieldNode(definition)) {
      const field = getField(type, definition);

      // Something unexpcected was passed into getField
      if (field === null) {
        // TODO: find better worded error message
        return throwObservable("field was not of the right type");
      }

      let resolvedObservable;
      // If there is a resolver for this field use it
      if (field.resolve instanceof Function) {
        const args = buildResolveArgs(definition, context);
        resolvedObservable = field.resolve(
          parent,
          args,
          context,
          // @ts-ignore
          null // that would be the info
        );
      } else {
        resolvedObservable = Observable.of(parent[field.name]);
      }

      if (!resolvedObservable) {
        return throwObservable("resolver returns empty value");
      }

      if (!(resolvedObservable instanceof Observable)) {
        return throwObservable("resolver does not return an observable");
      }

      // Directly return the leaf nodes
      if (definition.selectionSet === undefined) {
        return resolvedObservable;
      }

      return resolvedObservable.concatMap(emitted => {
        if (!emitted) {
          return throwObservable("resolver emitted empty value");
        }

        if (emitted instanceof Array) {
          return resolveArrayResults(definition, context, emitted, type);
        }

        const nextType = getResultType(type, definition, emitted);
        return resolveResult(definition, context, emitted, nextType);
      });
    }

    // It is no operationDefinitionand no fieldNode, so it seems like an error
    // TODO: throw better error here
    return throwObservable("Input was strange");
  }

  // Goes one level deeper into the query nesting
  function resolveResult(
    definition: SchemaNode,
    context: object,
    parent: any,
    type: GraphQLType | null
  ): Observable<any> {
    if (isDefinitionNode(definition)) {
      return throwObservable("Definition types should not be present here");
    }

    if (definition.kind === "FragmentSpread") {
      return throwObservable("Unsupported use of fragments");
    }

    if (!definition.selectionSet) {
      return Observable.of(parent);
    }

    return definition.selectionSet.selections.reduce((acc, sel) => {
      if (sel.kind === "FragmentSpread" || sel.kind === "InlineFragment") {
        return throwObservable("Unsupported use of fragments in selection set");
      }

      const result = resolve(sel, context, parent, type);
      const fieldName = (sel.alias || sel.name).value;

      return acc.combineLatest(result, objectAppendWithKey(fieldName));
    }, Observable.of({}));
  }

  function resolveArrayResults(
    definition: SchemaNode,
    context: object,
    parents: any[],
    parentType: GraphQLType | null
  ) {
    return parents.reduce((acc, result) => {
      const nextType = getResultType(parentType, definition, result);
      const resultObserver = resolveResult(
        definition,
        context,
        result,
        nextType
      );

      return acc.combineLatest(resultObserver, listAppend);
    }, Observable.of([]));
  }

  function getField(
    parentType: GraphQLType | null,
    definition: SchemaNode
  ): GraphQLField<any, any> | null {
    // Go one level deeper into the query
    if (parentType instanceof GraphQLObjectType && isFieldNode(definition)) {
      const parentFields = parentType.getFields();
      const fieldName = definition.name.value;

      if (parentFields[fieldName]) {
        return parentFields[definition.name.value];
      }
    }

    // These cases should ideally at some point be not existant,
    // but due to our partial implementation this loop-hole is needed
    return null;
  }

  function getResultType(
    parentType: GraphQLType | null,
    definition: SchemaNode,
    instance: any
  ): GraphQLType | null {
    const translateOperation = {
      query: "Query",
      mutation: "Mutation"
    };

    // Operation is given (query or mutation), returns a type
    if (isOperationDefinition(definition)) {
      return types[translateOperation[definition.operation]];
    }

    // Get one level deeper in the query nesting
    const field = getField(parentType, definition);
    if (field !== null) {
      const fieldType = getNamedType(field.type);

      // Make this abstract type concrete if possible
      if (
        fieldType instanceof GraphQLInterfaceType &&
        fieldType.resolveType instanceof Function
      ) {
        // We currenlty only allow resolveType to return a GraphQLObjectType
        // and we pass in the wrong values as we don't need this feature currently
        // @ts-ignore
        return getNamedType(fieldType.resolveType(instance));
      } else {
        return fieldType;
      }
    }

    return null;
  }
}

function throwObservable(error: string): Observable<any> {
  const graphqlErrorMessage = `graphqlObservable error: ${error}`;
  const graphqlError = new Error(graphqlErrorMessage);

  return Observable.throw(graphqlError);
}

function buildResolveArgs(definition: FieldNode, context: object) {
  return (definition.arguments || []).reduce(
    (carry, arg) => ({
      ...carry,
      ...(arg.value.kind === "Variable"
        ? // @ts-ignore
          { [arg.name.value]: context[arg.value.name.value] }
        : { [arg.name.value]: arg.value.value })
    }),
    {}
  );
}

const objectAppendWithKey = (key: string) => {
  return (destination: object, source: any) => ({
    ...destination,
    [key]: source
  });
};

const listAppend = <T = any>(destination: T[], source: T) => {
  return destination.concat(source);
};

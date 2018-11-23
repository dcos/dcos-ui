import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/throw";
import "rxjs/add/observable/of";
import "rxjs/add/observable/fromPromise";
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
  GraphQLField,
  GraphQLFieldResolver,
  isTypeSystemDefinitionNode,
  isTypeSystemExtensionNode,
  Kind
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
  return node.kind === Kind.OPERATION_DEFINITION;
}
function isFieldNode(node: SchemaNode): node is FieldNode {
  return node.kind === Kind.FIELD;
}

// We don't treat OperationDefinitions as Definitions but as entry points for our execution
function isDefinitionNode(node: SchemaNode): node is DefinitionNode {
  return (
    node.kind === Kind.FRAGMENT_DEFINITION ||
    isTypeSystemDefinitionNode(node) ||
    isTypeSystemExtensionNode(node)
  );
}

interface FieldWithResolver extends GraphQLField<any, any> {
  resolve: GraphQLFieldResolver<any, any, any>;
}

function isFieldWithResolver(
  field: GraphQLField<any, any>
): field is FieldWithResolver {
  return field.resolve instanceof Function;
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
        return throwObservable(
          `field was not of the right type. Given type: ${type}`
        );
      }

      const resolvedObservable = resolveField(
        field,
        definition,
        context,
        parent
      );

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

    if (definition.kind === Kind.FRAGMENT_SPREAD) {
      return throwObservable("Unsupported use of fragments");
    }

    if (!definition.selectionSet) {
      return Observable.of(parent);
    }

    return definition.selectionSet.selections.reduce((acc, sel) => {
      if (
        sel.kind === Kind.FRAGMENT_SPREAD ||
        sel.kind === Kind.INLINE_FRAGMENT
      ) {
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
      ...(arg.value.kind === Kind.VARIABLE
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

function resolveField(
  field: GraphQLField<any, any, { [argName: string]: any }>,
  definition: FieldNode,
  context: object,
  parent: any
): Observable<any> {
  if (!isFieldWithResolver(field)) {
    return Observable.of(parent[field.name]);
  }

  const args = buildResolveArgs(definition, context);
  const resolvedValue = field.resolve(
    parent,
    args,
    context,
    // @ts-ignore
    null // that would be the info
  );

  if (resolvedValue instanceof Observable) {
    return resolvedValue;
  }

  if (resolvedValue instanceof Promise) {
    return Observable.fromPromise(resolvedValue);
  }

  // It seems like a plain value
  return Observable.of(resolvedValue);
}

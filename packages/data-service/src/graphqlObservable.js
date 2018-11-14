import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/throw";
import "rxjs/add/observable/of";
import "rxjs/add/operator/combineLatest";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";
import "rxjs/add/operator/concatMap";

// TODO: add types with typescript

// WARNING: This is NOT a spec complete graphql implementation
// https://facebook.github.io/graphql/October2016/

// eslint-disable-next-line import/prefer-default-export
export function graphqlObservable(doc, schema, context) {
  if (doc.definitions.length !== 1) {
    return throwObservable("document root must have a single definition");
  }

  try {
    return resolve(schema._typeMap, doc.definitions[0], context, null).map(
      data => ({ data })
    );
  } catch (e) {
    console.log(e);

    return Observable.throw(e);
  }
}

function throwObservable(error) {
  const graphqlErrorMessage = `graphqlObservable error: ${error}`;
  const graphqlError = new Error(graphqlErrorMessage);

  return Observable.throw(graphqlError);
}

function resolve(types, definition, context, parent) {
  if (definition.kind === "OperationDefinition") {
    return resolveOperation(types, definition, context);
  }

  if (definition.kind === "Field" && definition.selectionSet !== undefined) {
    return resolveNode(types, definition, context, parent);
  }

  if (definition.kind === "Field") {
    return resolveLeaf(types, definition, context, parent);
  }

  return throwObservable(`kind not supported "${definition.kind}".`);
}

function resolveOperation(types, definition, context) {
  const translateOperation = {
    query: "Query",
    mutation: "Mutation"
  };

  const nextTypeMap = types[
    translateOperation[definition.operation]
  ].getFields();

  return resolveResult(null, nextTypeMap, definition, context);
}

function resolveNode(types, definition, context, parent) {
  const args = buildResolveArgs(definition, context);
  const resolver = types[definition.name.value];

  if (!resolver) {
    return throwObservable(`missing resolver for ${definition.name.value}`);
  }

  const resolvedObservable = resolver.resolve(
    parent,
    args,
    context,
    null // that would be the info
  );

  if (!resolvedObservable) {
    return throwObservable("resolver returns empty value");
  }

  if (!(resolvedObservable instanceof Observable)) {
    return throwObservable("resolver does not return an observable");
  }

  return resolvedObservable.concatMap(emitted => {
    if (!emitted) {
      return throwObservable("resolver emitted empty value");
    }

    if (emitted instanceof Array) {
      return resolveArrayResults(emitted, types, definition, context, resolver);
    }

    return resolveResult(emitted, types, definition, context, resolver);
  });
}

function resolveLeaf(types, definition, context, parent) {
  return Observable.of(parent[definition.name.value]);
}

function resolveResult(parent, types, definition, context, resolver) {
  return definition.selectionSet.selections.reduce((acc, sel) => {
    const refinedTypes = refineTypes(resolver, parent, types);
    const result = resolve(refinedTypes, sel, context, parent);
    const fieldName = (sel.alias || sel.name).value;

    return acc.combineLatest(result, objectAppendWithKey(fieldName));
  }, Observable.of({}));
}

function resolveArrayResults(parents, types, definition, context, resolver) {
  return parents.reduce((acc, result) => {
    const resultObserver = resolveResult(
      result,
      types,
      definition,
      context,
      resolver
    );

    return acc.combineLatest(resultObserver, listAppend);
  }, Observable.of([]));
}

function buildResolveArgs(definition, context) {
  return definition.arguments
    .map(arg => {
      return arg.value.kind === "Variable"
        ? { [arg.name.value]: context[arg.value.name.value] }
        : { [arg.name.value]: arg.value.value };
    })
    .reduce(Object.assign, {});
}

function refineTypes(resolver, parent, types) {
  return resolver && resolver.type.resolveType
    ? resolver.type.resolveType(parent).getFields()
    : types;
}

const objectAppendWithKey = key => {
  return (destination, source) => ({ ...destination, [key]: source });
};

const listAppend = (destination, source) => {
  return destination.concat(source);
};

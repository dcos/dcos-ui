import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/throw";
import "rxjs/add/observable/of";
import "rxjs/add/operator/combineLatest";
import "rxjs/add/operator/do";
import "rxjs/add/operator/map";
import "rxjs/add/operator/concatMap";

// TODO: refactor this once it has a more comprehensive implementation
// of the graphql api

// WARNING: This is NOT a spec complete graphql implementation
// https://facebook.github.io/graphql/October2016/

const translateOperation = {
  query: "Query",
  mutation: "Mutation"
};

function resolveFields(types, definition, context, parent) {
  return definition.selectionSet.selections.reduce((acc, sel) => {
    const result = resolveStep(types, sel, context, parent);

    const merger = (acc, emitted) => {
      const fieldName = (sel.alias || sel.name).value;

      return { ...acc, [fieldName]: emitted };
    };

    return acc.combineLatest(result, merger);
  }, Observable.of({}));
}

function resolveList(values, resolver, types, definition, context) {
  return values.reduce((acc, result) => {
    const refinedTypes = resolver.type.resolveType
      ? resolver.type.resolveType(values).getFields()
      : types;

    const resultObserver = resolveFields(
      refinedTypes,
      definition,
      context,
      result
    );

    const merger = (acc, emitted) => {
      return acc.concat(emitted);
    };

    return acc.combineLatest(resultObserver, merger);
  }, Observable.of([]));
}

function resolveStep(types, definition, context, parent) {
  if (definition.kind === "OperationDefinition") {
    const nextTypeMap = types[
      translateOperation[definition.operation]
    ].getFields();

    return resolveFields(nextTypeMap, definition, context, parent);
  }

  // Node Field
  if (definition.kind === "Field" && definition.selectionSet !== undefined) {
    const args = definition.arguments
      .map(arg => {
        return arg.value.kind === "Variable"
          ? { [arg.name.value]: context[arg.value.name.value] }
          : { [arg.name.value]: arg.value.value };
      })
      .reduce(Object.assign, {});

    const resolver = types[definition.name.value];
    if (!resolver) {
      return Observable.throw(
        new Error(
          `graphqlObservable error: cant find resolver for ${definition.name.value}`
        )
      );
    }

    const resolvedObservable = resolver.resolve(
      parent,
      args,
      context,
      null // that would be the info
    );

    if (!resolvedObservable) {
      return Observable.throw(
        new Error("graphqlObservable error: empty resolution")
      );
    }

    if (!(resolvedObservable instanceof Observable)) {
      return Observable.throw(
        new Error("graphqlObservable error: not an observable")
      );
    }

    return resolvedObservable.concatMap(emittedResults => {
      if (!emittedResults) {
        return Observable.throw(
          new Error("graphqlObservable error: result not emitted")
        );
      }

      if (!emittedResults.map) {
        const refinedTypes = resolver.type.resolveType
          ? resolver.type.resolveType(emittedResults).getFields()
          : types;

        return resolveFields(refinedTypes, definition, context, emittedResults);
      }

      return resolveList(emittedResults, resolver, types, definition, context);
    });
  }

  if (definition.kind === "Field") {
    return Observable.of(parent[definition.name.value]);
  }

  return Observable.throw(
    new Error(
      `graphqlObservable error: kind ${definition.kind} is not supported`
    )
  );
}

// eslint-disable-next-line import/prefer-default-export
export function graphqlObservable(doc, schema, context) {
  if (doc.definitions.length !== 1) {
    return Observable.throw(
      new Error("graphqlObservable error: unsupported multi root document")
    );
  }

  return resolveStep(
    schema._typeMap,
    doc.definitions[0],
    context,
    null
  ).map(data => ({ data }));
}

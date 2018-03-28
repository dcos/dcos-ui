import { Observable } from "rxjs/Observable";

// TODO: refactor this once it has a more compreehensive implementation
// of the graphql api

// WARNING: This is NOT a spec complete graphql implementation
// https://facebook.github.io/graphql/October2016/

/* eslint-disable-next-line import/prefer-default-export */
export const graphqlObservable = (doc, schema, context) => {
  const translateOperation = {
    query: "Query"
  };

  const resolveStep = (typeMap, definition, context, parent) => {
    if (definition.kind === "OperationDefinition") {
      const nextTypeMap = typeMap[
        translateOperation[definition.operation]
      ].getFields();

      return definition.selectionSet.selections.reduce((acc, sel) => {
        const resolvedObservable = resolveStep(nextTypeMap, sel, context);

        const merger = (acc, emitted) => {
          const propertyName = (definition.name || sel.name).value;

          return { ...acc, [propertyName]: emitted };
        };

        return acc.combineLatest(resolvedObservable, merger);
      }, Observable.of({}));
    }

    // Node Field
    if (definition.kind === "Field" && definition.selectionSet !== undefined) {
      const args = definition.arguments
        .map(arg => {
          if (arg.value.kind === "Variable") {
            return { [arg.name.value]: context[arg.value.name.value] };
          } else {
            return { [arg.name.value]: arg.value.value };
          }
        })
        .reduce(Object.assign, {});

      const resolvedObservable = typeMap[definition.name.value].resolve(
        parent,
        args,
        context,
        null // that would be the info
      );

      return resolvedObservable.map(emittedResults => {
        return emittedResults.map(result => {
          return definition.selectionSet.selections.reduce((acc, sel) => {
            acc[sel.name.value] = resolveStep(typeMap, sel, context, result);

            return acc;
          }, {});
        });
      });
    }

    // LeafField
    if (definition.kind === "Field") {
      return parent[definition.name.value];
    }

    return Observable.throw(
      new Error("graphqlObservable does not recognise ${definition.kind}")
    );
  };

  if (doc.definitions.length === 1) {
    return resolveStep(schema._typeMap, doc.definitions[0], context, null);
  }

  return doc.definitions.reduce((acc, definition) => {
    const resolvedObservable = resolveStep(
      schema._typeMap,
      definition,
      context,
      null
    );

    const merger = (acc, resolved) => {
      return { ...acc, ...resolved };
    };

    return acc.combineLatest(resolvedObservable, merger);
  }, Observable.of({}));
};

/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import { componentFromStream, graphqlObservable } from "@dcos/data-service";
import gql from "graphql-tag";
import { Trans } from "@lingui/macro";

import { Subject } from "rxjs";
import {
  switchMap,
  catchError,
  tap,
  startWith,
  combineLatest
} from "rxjs/operators";

import { schema } from "./data/repositoriesModel";
import AddRepositoryFormModal from "./components/AddRepositoryFormModal";

// Imported from the Cosmos Store
const getErrorMessage = (response = {}) => {
  if (typeof response === "string") {
    return response;
  }

  return (
    response.description ||
    response.message || <Trans render="span">An error has occurred.</Trans>
  );
};

const addPackageRepositoryMutation = gql`
  mutation {
    addPackageRepository(name: $name, uri: $uri, priority: $index) {
      name
    }
  }
`;

const addRepositoryGraphql = (name, uri, index) => {
  return graphqlObservable(addPackageRepositoryMutation, schema, {
    name,
    uri,
    index
  });
};

const addRepositoryEvent$ = new Subject();
const addRepository$ = addRepositoryEvent$.pipe(
  switchMap(repository => {
    return addRepositoryGraphql(
      repository.name,
      repository.uri,
      repository.priority
    ).pipe(
      tap(() => {
        repository.complete();
      })
    );
  }),
  catchError(error => {
    // Add the error as value and continue
    return addRepository$.pipe(
      startWith({
        error: getErrorMessage(error.response),
        pendingRequest: false
      })
    );
  })
);

const RepositoriesAdd = componentFromStream(props$ => {
  return props$.pipe(
    combineLatest(addRepository$.pipe(startWith({})), (props, result) => {
      return (
        <AddRepositoryFormModal
          numberOfRepositories={props.numberOfRepositories}
          open={props.open}
          addRepository={value =>
            addRepository$.next({ complete: props.onClose, ...value })
          }
          onClose={props.onClose}
          errorMsg={result.error}
        />
      );
    })
  );
});

export default RepositoriesAdd;

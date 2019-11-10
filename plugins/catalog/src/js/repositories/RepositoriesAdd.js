/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import { componentFromStream } from "@dcos/data-service";
import { DataLayerType } from "@extension-kid/data-layer";
import gql from "graphql-tag";
import { Trans } from "@lingui/macro";

import { Subject, BehaviorSubject } from "rxjs";
import {
  switchMap,
  catchError,
  tap,
  startWith,
  combineLatest
} from "rxjs/operators";

import container from "#SRC/js/container";
import AddRepositoryFormModal from "./components/AddRepositoryFormModal";

const dataLayer = container.get(DataLayerType);

// Imported from the Cosmos Store
const getErrorMessage = (response = {}) => {
  if (typeof response === "string") {
    return response;
  }

  if (response) {
    return (
      response.description ||
      response.message || <Trans render="span">An error has occurred.</Trans>
    );
  }

  return <Trans render="span">An error has occurred.</Trans>;
};

const addPackageRepositoryMutation = gql`
  mutation {
    addPackageRepository(name: $name, uri: $uri, index: $index) {
      name
      uri
      index
    }
  }
`;

const addRepositoryGraphql = (name, uri, index) =>
  dataLayer.query(addPackageRepositoryMutation, {
    name,
    uri,
    index
  });

const addRepositoryEvent$ = new Subject();
const pendingRequest$ = new BehaviorSubject(false);
const addRepository$ = addRepositoryEvent$.pipe(
  switchMap(repository =>
    addRepositoryGraphql(
      repository.name,
      repository.uri,
      repository.priority
    ).pipe(
      tap(() => {
        pendingRequest$.next(false);
        repository.complete();
      })
    )
  ),
  catchError(error => {
    pendingRequest$.next(false);
    // Add the error as value and continue
    return addRepository$.pipe(
      startWith({
        error: getErrorMessage(error.response)
      })
    );
  })
);

const RepositoriesAdd = componentFromStream(props$ =>
  props$.pipe(
    combineLatest(
      pendingRequest$,
      addRepository$.pipe(startWith({})),
      (props, pendingRequest, result) => (
        <AddRepositoryFormModal
          pendingRequest={pendingRequest}
          numberOfRepositories={props.numberOfRepositories}
          open={props.open}
          addRepository={value => {
            pendingRequest$.next(true);
            return addRepositoryEvent$.next({
              complete: props.onClose,
              ...value
            });
          }}
          onClose={props.onClose}
          errorMsg={result.error}
        />
      )
    )
  )
);

export default RepositoriesAdd;

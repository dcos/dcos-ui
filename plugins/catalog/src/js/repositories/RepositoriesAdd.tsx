import * as React from "react";

import { componentFromStream } from "@dcos/data-service";
import { DataLayerType } from "@extension-kid/data-layer";
import gql from "graphql-tag";
import { Trans } from "@lingui/react";

import { Subject, BehaviorSubject } from "rxjs";
import {
  switchMap,
  catchError,
  tap,
  startWith,
  combineLatest,
} from "rxjs/operators";

import container from "#SRC/js/container";
import AddRepositoryFormModal from "./components/AddRepositoryFormModal";

const dataLayer = container.get(DataLayerType);

// Imported from the Cosmos Store
const getErrorMessage = (response = { description: null, message: null }) => {
  if (typeof response === "string") {
    return response;
  }

  return (
    response.description ||
    response.message || <Trans render="span" id="An error has occurred." />
  );
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
    index,
  });

const addRepositoryEvent$ = new Subject();
const pendingRequest$ = new BehaviorSubject(false);
const addRepository$ = addRepositoryEvent$.pipe(
  switchMap((repository) =>
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
  catchError((error) => {
    pendingRequest$.next(false);
    // Add the error as value and continue
    return addRepository$.pipe(
      startWith({
        error: getErrorMessage(error.response),
      })
    );
  })
);

const RepositoriesAdd = componentFromStream((props$) =>
  props$.pipe(
    combineLatest(
      pendingRequest$,
      addRepository$.pipe(startWith({})),
      (props, pendingRequest, result) => {
        const addRepository = (value) => {
          pendingRequest$.next(true);
          return addRepositoryEvent$.next({
            complete: props.onClose,
            ...value,
          });
        };
        return (
          <AddRepositoryFormModal
            pendingRequest={pendingRequest}
            numberOfRepositories={props.numberOfRepositories}
            open={props.open}
            addRepository={addRepository}
            onClose={props.onClose}
            errorMsg={result.error}
          />
        );
      }
    )
  )
);

export default RepositoriesAdd;

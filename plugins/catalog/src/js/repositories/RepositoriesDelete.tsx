import * as React from "react";
import { Trans } from "@lingui/macro";

import { Subject, of, BehaviorSubject } from "rxjs";
import {
  combineLatest,
  startWith,
  map,
  catchError,
  switchMap,
  tap
} from "rxjs/operators";

import { DataLayerType } from "@extension-kid/data-layer";
import { componentFromStream } from "@dcos/data-service";
import gql from "graphql-tag";

import container from "#SRC/js/container";

import RepositoriesDeleteConfirm from "./components/RepositoriesDeleteConfirm";
import RepositoriesError from "./components/RepositoriesError";

const dataLayer = container.get(DataLayerType);

const getErrorMessage = (response = {}) => {
  if (typeof response === "string") {
    return response;
  }

  return (
    response.description ||
    response.message || <Trans render="span">An error has occurred.</Trans>
  );
};

const removePackageRepository = gql`
  mutation {
    removePackageRepository(name: $name, uri: $uri) {
      name
    }
  }
`;

const removePackageRepositoryGraphql = (name, uri) =>
  dataLayer.query(removePackageRepository, {
    name,
    uri
  });

const deleteEvent$ = new Subject();
const pendingRequest$ = new BehaviorSubject(false);
const deleteRepository$ = deleteEvent$.pipe(
  switchMap(repository =>
    removePackageRepositoryGraphql(repository.name, repository.url).pipe(
      map(result => ({
        result
      })),
      tap(() => {
        pendingRequest$.next(false);
        repository.complete();
      })
    )
  ),
  startWith({ pendingRequest: false }),
  catchError(error => {
    pendingRequest$.next(false);
    return deleteRepository$.pipe(
      startWith({
        error: getErrorMessage(error.response)
      })
    );
  })
);

const RepositoriesDelete = componentFromStream(props$ =>
  props$.pipe(
    combineLatest(
      pendingRequest$,
      deleteRepository$.pipe(startWith({})),
      (props, pendingRequest, response) => ({
        open: !!props.repository || pendingRequest,
        isPending: pendingRequest,
        ...props,
        ...response
      })
    ),
    map(props => (
      <RepositoriesDeleteConfirm
        onCancel={props.onClose}
        onDelete={() => {
          pendingRequest$.next(true);
          return deleteEvent$.next({
            complete: props.onClose,
            ...props.repository
          });
        }}
        pendingRequest={props.isPending}
        repository={props.repository}
        deleteError={props.error}
        open={props.open}
      />
    )),
    catchError(err => of(<RepositoriesError err={err} />))
  )
);

export default RepositoriesDelete;

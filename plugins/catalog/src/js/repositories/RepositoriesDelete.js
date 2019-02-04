import React from "react";
import { Trans } from "@lingui/macro";

import { Subject, of } from "rxjs";
import {
  combineLatest,
  startWith,
  map,
  catchError,
  switchMap,
  tap
} from "rxjs/operators";

import { componentFromStream, graphqlObservable } from "@dcos/data-service";
import gql from "graphql-tag";

import RepositoriesDeleteConfirm from "./components/RepositoriesDeleteConfirm";
import RepositoriesError from "./components/RepositoriesError";
import { schema } from "./data/repositoriesModel";

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

const removePackageRepositoryGraphql = (name, uri) => {
  return graphqlObservable(removePackageRepository, schema, {
    name,
    uri
  });
};

const deleteEvent$ = new Subject();
const deleteRepository$ = deleteEvent$.pipe(
  switchMap(repository => {
    return removePackageRepositoryGraphql(repository.name, repository.url).pipe(
      startWith({ pendingRequest: true }),
      map(result => {
        return {
          result,
          pendingRequest: false
        };
      }),
      tap(() => {
        repository.complete();
      })
    );
  }),
  startWith({ pendingRequest: false }),
  catchError(error => {
    return deleteRepository$.pipe(
      startWith({
        error: getErrorMessage(error.response),
        pendingRequest: false
      })
    );
  })
);

const RepositoriesDelete = componentFromStream(props$ => {
  return props$.pipe(
    combineLatest(deleteRepository$, (props, response) => {
      return {
        open: !!props.repository || response.pendingRequest,
        ...props,
        ...response
      };
    }),
    map(props => {
      return (
        <RepositoriesDeleteConfirm
          onCancel={props.onClose}
          onDelete={() =>
            deleteEvent$.next({ complete: props.onClose, ...props.repository })
          }
          pendingRequest={props.pendingRequest}
          repository={props.repository}
          deleteError={props.error}
          open={props.open}
        />
      );
    }),
    catchError(err => of(<RepositoriesError err={err} />))
  );
});

export default RepositoriesDelete;

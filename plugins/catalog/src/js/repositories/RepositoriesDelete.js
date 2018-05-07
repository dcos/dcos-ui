import React from "react";

import { componentFromStream } from "data-service";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/combineLatest";
import "rxjs/add/operator/startWith";
import "rxjs/add/operator/map";
import "rxjs/add/operator/catch";

import { deleteRepository } from "./data/repositoriesStream";

import RepositoriesDeleteConfirm from "./components/RepositoriesDeleteConfirm";
import RepositoriesError from "./components/RepositoriesError";

const getErrorMessage = (response = {}) => {
  if (typeof response === "string") {
    return response;
  }

  return response.description || response.message || "An error has occurred.";
};

const deleteEvent$ = new Subject();
const deleteRepository$ = deleteEvent$
  .switchMap(repository => {
    return deleteRepository(repository.name, repository.url)
      .startWith({ pendingRequest: true })
      .map(result => {
        return {
          result,
          pendingRequest: false
        };
      })
      .do(() => {
        repository.complete();
      });
  })
  .startWith({ pendingRequest: false })
  .catch(error => {
    return deleteRepository$.startWith({
      error: getErrorMessage(error.response),
      pendingRequest: false
    });
  });

const RepositoriesDelete = componentFromStream(props$ => {
  return props$
    .combineLatest(deleteRepository$, (props, response) => {
      return {
        open: !!props.repository || response.pendingRequest,
        ...props,
        ...response
      };
    })
    .map(props => {
      return (
        <RepositoriesDeleteConfirm
          onCancel={props.onClose}
          onDelete={() =>
            deleteEvent$.next({ complete: props.onClose, ...props.repository })}
          pendingRequest={props.pendingRequest}
          repository={props.repository}
          deleteError={props.error}
          open={props.open}
        />
      );
    })
    .catch(err => Observable.of(<RepositoriesError err={err} />));
});

export default RepositoriesDelete;

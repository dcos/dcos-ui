/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import { componentFromStream, graphqlObservable } from "data-service";
import gql from "graphql-tag";

import { Subject } from "rxjs/Subject";
import "rxjs/add/operator/combineLatest";
import "rxjs/add/operator/do";
import "rxjs/observable/empty";

import { schema } from "./data/repositoriesModel";
import AddRepositoryFormModal from "./components/AddRepositoryFormModal";

// Imported from the Cosmos Store
const getErrorMessage = (response = {}) => {
  if (typeof response === "string") {
    return response;
  }

  return response.description || response.message || "An error has occurred.";
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
const addRepository$ = addRepositoryEvent$
  .switchMap(repository => {
    return addRepositoryGraphql(
      repository.name,
      repository.uri,
      repository.priority
    ).do(() => {
      repository.complete();
    });
  })
  .catch(error => {
    // Add the error as value and continue
    return addRepository$.startWith({
      error: getErrorMessage(error.response),
      pendingRequest: false
    });
  });

const RepositoriesAdd = componentFromStream(props$ => {
  return props$.combineLatest(addRepository$.startWith({}), (props, result) => {
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
  });
});

export default RepositoriesAdd;

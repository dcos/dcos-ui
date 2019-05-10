import { i18nMark } from "@lingui/react";
import React from "react";
import { BehaviorSubject, of } from "rxjs";
import {
  switchMap,
  combineLatest,
  catchError,
  map,
  debounceTime,
  startWith
} from "rxjs/operators";

import { DataLayerType } from "@extension-kid/data-layer";
import { componentFromStream } from "@dcos/data-service";

import gql from "graphql-tag";

import RepositoryList from "#SRC/js/structs/RepositoryList";
import container from "#SRC/js/container";

import RepositoriesTabUI from "./components/RepositoriesTabUI";
import RepositoriesLoading from "./components/RepositoriesLoading";
import RepositoriesError from "./components/RepositoriesError";

const dataLayer = container.get(DataLayerType);

const packageRepositoryQuery = filter => gql`
  query {
    packageRepository(filter: "${filter}") {
      name
      uri
    }
  }
`;

const searchTerm$ = new BehaviorSubject("");

const keypressDebounceTime = 250;
const searchResults$ = searchTerm$.pipe(
  debounceTime(keypressDebounceTime),
  switchMap(searchTerm => {
    const query = packageRepositoryQuery(searchTerm);

    return dataLayer.query(query).pipe(
      map(result => {
        // Backwards compatible with the previous struct/RepositoryList for packages
        return new RepositoryList({
          items: result.data.packageRepository
        });
      })
    );
  })
);

const components$ = searchTerm$.pipe(
  combineLatest(searchResults$, (searchTerm, packageRepository) => {
    return { packageRepository, searchTerm };
  }),
  // We map over the data and return a component to render
  map(data => {
    return (
      <RepositoriesTabUI
        repositories={data.packageRepository}
        searchTerm={data.searchTerm}
        onSearch={value => searchTerm$.next(value)}
      />
    );
  }),
  // The first component is the loading
  startWith(<RepositoriesLoading />),
  // If anything goes wrong, we render an error component
  catchError(err => of(<RepositoriesError err={err} />))
);

// componentFromStream create a single component who render the latest emitted
// component from the stream
const RepositoriesList = componentFromStream(() => components$);

// the reason we don`t `export componentFromStream()` is so you can add those
// router specific things
RepositoriesList.routeConfig = {
  label: i18nMark("Package Repositories"),
  matches: /^\/settings\/repositories/
};

module.exports = RepositoriesList;

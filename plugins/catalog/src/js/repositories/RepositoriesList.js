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

// graphqlObservable is our in house implementation of the graphql (not spec compliant yet)
// componentFromStream transforms a stream of data into a React Component
import { componentFromStream, graphqlObservable } from "@dcos/data-service";

// tools to make easier to create schemas and queries
// import { makeExecutableSchema } from "graphql-tools";
import gql from "graphql-tag";

import RepositoryList from "#SRC/js/structs/RepositoryList";

// UI components
import RepositoriesTabUI from "./components/RepositoriesTabUI";
import RepositoriesLoading from "./components/RepositoriesLoading";
import RepositoriesError from "./components/RepositoriesError";

// Using the data layer

// 1. We first make a schema out of the resolvers and typeDefinitions
// You could as well just import (or inject) the default schema
// const schema = makeExecutableSchema({
//   typeDefs,
//   resolvers
// });
import { schema } from "./data/repositoriesModel";

// 2. We declare which data our component needs in graphql (data down)
const packageRepositoryQuery = filter => gql`
  query {
    packageRepository(filter: "${filter}") {
      name
      uri
    }
  }
`;

// 3. We create an event handler as a stream to deal with search (events up)
const searchTerm$ = new BehaviorSubject("");

// 4. We compose the result with the query, and massage it down the pipe until
// we get the props for our component.
// The idea is from an Observable of data and events, compose a stream o React.Components

const keypressDebounceTime = 250;
const searchResults$ = searchTerm$.pipe(
  debounceTime(keypressDebounceTime),
  switchMap(searchTerm => {
    const query = packageRepositoryQuery(searchTerm);

    return graphqlObservable(query, schema).pipe(
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

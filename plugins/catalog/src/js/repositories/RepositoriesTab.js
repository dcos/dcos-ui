import React from "react";
import { Observable } from "rxjs/Observable";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import "rxjs/add/operator/switchMap";

// Recompose helps handle data down and event up as streams
import { componentFromStream } from "#PACKAGES/data-service/recomposeRx";

// Our in-house solution to resolve graphql queries using streams
import { graphqlObservable } from "#PACKAGES/data-service/graphqlObservable";

// tools to make easier to create schemas and queries
import { makeExecutableSchema } from "graphql-tools";
import gql from "graphql-tag";

// Streams we get our data from
import { liveFetchRepositories } from "#PLUGINS/catalog/src/js/repositories/repositoriesStream";
import RepositoryList from "#SRC/js/structs/RepositoryList";

// The graphql schema and resolvers for those streams;
import { typeDefs, resolvers } from "./repositoriesModel";

// UI components
import RepositoriesTabUI from "./RepositoriesTabUI";

// Using the data layer

// 1. We first make an schema out of the resolvers and typeDefinitions
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

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

const packageRepository$ = liveFetchRepositories();

const components$ = searchTerm$
  .switchMap(searchTerm => {
    const query = packageRepositoryQuery(searchTerm);
    const liveQuery = graphqlObservable(query, schema, {
      query: packageRepository$
    }).map(result => {
      // Backwards compatible with the previous struct/RepositoryList for packages
      return new RepositoryList({
        items: result.packageRepository
      });
    });

    return liveQuery.map(packageRepository => {
      return { packageRepository, searchTerm };
    });
  })
  // We map over the data and return a component to render
  .map(data => {

    return (
      <RepositoriesTabUI
        repositories={data.packageRepository}
        searchTerm={data.searchTerm}
        // onSearch has arity 2 which prevents to pass `next` as reference
        onSearch={(value) => {
          searchTerm$.next(value);
        }}
      />
    );
  })
  // The first component is the loading
  .startWith(<RepositoriesTabUI.Loading />)
  // If anything goes wrong, we render an error component
  .catch(err => {
    console.error(err);

    return Observable.of(<RepositoriesTabUI.Error err={err} />);
  });

// componentFromStream create a single component who render the latest emitted
// component from the stream
const RepositoriesTab = componentFromStream(() => components$);

// the reason we don`t `export componentFromStream()` is so you can add those
// router specific things
RepositoriesTab.routeConfig = {
  label: "Package Repositories",
  matches: /^\/settings\/repositories/
};

module.exports = RepositoriesTab;

import React from "react";
import { componentFromStream } from "recompose";

import RepositoriesTabUI from "#SRC/js/components/RepositoriesTabUI";

import {
  packageSources$,
  searchPackageSource$
} from "#SRC/js/streams/CosmosPackagesStream";

const onSearch = term => {
  searchPackageSource$.next(term);
};

const components$ = packageSources$
  .map(data => {
    return (
      <RepositoriesTabUI
        repositories={data.repositories}
        searchTerm={data.searchTerm}
        onSearch={onSearch}
      />
    );
  })
  .startWith(<RepositoriesTabUI.Loading />)
  .catch(_err => <RepositoriesTabUI.Error />);

const RepositoriesTab = componentFromStream(() => components$);

RepositoriesTab.routeConfig = {
  label: "Package Repositories",
  matches: /^\/settings\/repositories/
};

module.exports = RepositoriesTab;

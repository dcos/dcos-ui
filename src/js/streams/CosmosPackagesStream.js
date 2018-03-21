// to be replaced with https://github.com/dcos/dcos-ui/pull/2840
import { Observable, Subject } from "rxjs";

import CosmosPackagesStore from "#SRC/js/stores/CosmosPackagesStore";

const cosmosPackageWrapper$ = Observable.timer(1000, 2000)
  .map(() => CosmosPackagesStore.fetchRepositories())
  .map(() => CosmosPackagesStore.getRepositories())
  .distinctUntilChanged();

const searchPackageSource$ = new Subject();
const search$ = searchPackageSource$
  .merge(Observable.of(""))
  .publishReplay(1)
  .refCount();

const packageSources$ = cosmosPackageWrapper$
  .combineLatest(search$, (repositories, searchTerm) => {
    return { repositories, searchTerm };
  })
  .map(({ repositories, searchTerm }) => {
    return {
      repositories: repositories.filterItemsByText(searchTerm),
      searchTerm
    };
  });

export { packageSources$, searchPackageSource$ };

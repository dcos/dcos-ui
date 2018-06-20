import * as PropTypes from "prop-types";
import * as React from "react";
import { routerShape, LocationDescriptor } from "react-router";
// tslint:disable-next-line:no-submodule-imports
import { BehaviorSubject } from "rxjs/BehaviorSubject";
// tslint:disable-next-line:no-submodule-imports
import "rxjs/add/observable/empty";

import { graphqlObservable, componentFromStream } from "data-service";
import gql from "graphql-tag";

import JobsTabLoading from "./components/JobsTabLoading";
import JobsTab from "./components/JobsTab";

import JobModel, { JobsQueryArgs } from "./data/JobModel";
import { combineLatest } from "rxjs/observable/combineLatest";
import { Observable } from "rxjs/Observable";
import JobTree from "#SRC/js/structs/JobTree";
import { Job } from "#PLUGINS/jobs/src/js/types/Job";
import { JobConnection } from "#PLUGINS/jobs/src/js/types/JobConnection";
import { parseJobs } from "#SRC/js/utils/MetronomeUtil";

interface JobsOverviewProps {
  params: { id?: string };
  location: LocationDescriptor;
}

const jobsOverviewQuery: any = gql`
  query {
    jobs(
      namespace: $namespace
      filter: $filter
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      filteredCount
      totalCount
      nodes
    }
  }
`;

const filters$ = new BehaviorSubject<JobsQueryArgs>({});

const jobs$: Observable<JobConnection> = filters$
  .debounceTime(250)
  .switchMap((filters: JobsQueryArgs) => {
    return graphqlObservable(
      jobsOverviewQuery,
      JobModel,
      filters
    ) as Observable<{ data: { jobs: JobConnection } }>;
  })
  .map(data => data.data.jobs);

const JobsOverview = componentFromStream(
  (props$: Observable<JobsOverviewProps>) => {
    return combineLatest(filters$, props$, jobs$)
      .map(([filters, props, jobs]) => {
        function handleFilterChange(searchString: string) {
          filters$.next({ filter: searchString, ...filters });
        }
        function resetFilter() {
          filters$.next({});
        }

        const root: JobTree = new JobTree(parseJobs(jobs.nodes));

        // item is necessary for legacy jobtree implementation
        let item: Job | JobTree;
        if (props.params.id !== undefined) {
          item = root.findItem(item => {
            return (
              item instanceof JobTree &&
              item.id === decodeURIComponent(props.params.id || "")
            );
          });
        } else {
          item = root;
        }

        return (
          <JobsTab
            key={undefined}
            root={root}
            item={item}
            filteredJobs={item.getItems()}
            searchString={filters.filter || ""}
            handleFilterChange={handleFilterChange}
            resetFilter={resetFilter}
            hasFilterApplied={jobs.filteredCount < jobs.totalCount}
          />
        );
      })
      .startWith(<JobsTabLoading root={new JobTree({ items: [] })} />)
      .catch(() => {
        return Observable.of(<span />);
      });
  }
);

JobsOverview.contextTypes = {
  router: routerShape,
  location: PropTypes.object.isRequired
};

export default JobsOverview;

import * as React from "react";
// tslint:disable-next-line:no-submodule-imports
import { BehaviorSubject } from "rxjs/BehaviorSubject";
// tslint:disable-next-line:no-submodule-imports
import "rxjs/add/observable/empty";

import { graphqlObservable, componentFromStream } from "data-service";
import gql from "graphql-tag";

import JobsTabLoading from "./components/JobsTabLoading";
import JobsTabError from "./components/JobsTabError";
import JobsTabList from "./components/JobsTabList";
import JobsTabEmpty from "./components/JobsTabEmpty";

import JobFormModalContainer from "./JobFormModalContainer";

import JobModel, {
  JobsQueryArgs,
  SortOption,
  SortDirection
} from "./data/JobModel";
import { combineLatest } from "rxjs/observable/combineLatest";
import { Observable, Subscribable } from "rxjs/Observable";
import { JobConnection } from "#PLUGINS/jobs/src/js/types/JobConnection";

interface JobsOverviewProps {
  namespace: string[];
  initialFilter: string;
  setFilter(filter: string | null): void;
}

const JobsOverview = componentFromStream<JobsOverviewProps>(
  (props$: Subscribable<JobsOverviewProps>): Subscribable<React.ReactNode> => {
    const jobsOverviewQuery: any = gql`
      query {
        jobs(
          namespace: $namespace
          filter: $filter
          sortBy: $sortBy
          sortDirection: $sortDirection
        ) {
          namespace
          filteredCount
          totalCount
          nodes
        }
      }
    `;

    const isModalOpen$ = new BehaviorSubject<boolean>(false);

    const filter$ = new BehaviorSubject<string>("");

    (props$ as Observable<JobsOverviewProps>)
      .map(props => props.setFilter)
      .distinctUntilChanged()
      .combineLatest(filter$)
      .subscribe(([setFilter, filter]) => setFilter(filter));

    const namespace$ = (props$ as Observable<JobsOverviewProps>)
      .map(props => props.namespace)
      .distinctUntilChanged();

    const args$: Observable<JobsQueryArgs> = combineLatest(
      namespace$,
      filter$
    ).map(([namespace, filter]) => ({
      namespace,
      filter,
      sortBy: "ID" as SortOption,
      sortDirection: "ASC" as SortDirection
    }));

    const jobs$: Observable<JobConnection> = args$
      .sampleTime(250)
      .switchMap((args: JobsQueryArgs) => {
        return graphqlObservable(
          jobsOverviewQuery,
          JobModel,
          args
        ) as Observable<{ data: { jobs: JobConnection } }>;
      })
      .map(data => data.data.jobs);

    return combineLatest(filter$, isModalOpen$, jobs$)
      .map(([filter, isModalOpen, jobs]) => {
        function handleFilterChange(filter: string) {
          filter$.next(filter);
        }
        function resetFilter() {
          handleFilterChange("");
        }
        function handleCloseModal() {
          isModalOpen$.next(false);
        }
        function handleOpenModal() {
          isModalOpen$.next(true);
        }

        const modal = (
          <JobFormModalContainer
            open={isModalOpen}
            onClose={handleCloseModal}
          />
        );

        if (jobs.totalCount > 0) {
          return (
            <JobsTabList
              data={jobs}
              filter={filter}
              modal={modal}
              handleFilterChange={handleFilterChange}
              handleOpenJobFormModal={handleOpenModal}
              resetFilter={resetFilter}
            />
          );
        }

        return (
          <JobsTabEmpty
            key={undefined}
            handleOpenJobFormModal={handleOpenModal}
            modal={modal}
            namespace={jobs.namespace}
          />
        );
      })
      .startWith(<JobsTabLoading />)
      .catch(() => Observable.of(<JobsTabError />));
  }
);

export default JobsOverview;

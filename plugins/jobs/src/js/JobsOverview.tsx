import * as React from "react";
import Router, {
  InjectedRouter,
  LocationDescriptor,
  withRouter
} from "react-router";
import {
  BehaviorSubject,
  Observable,
  Subscribable as RxSubscribable,
  combineLatest,
  of
} from "rxjs";
import {
  map,
  sampleTime,
  switchMap,
  startWith,
  catchError
} from "rxjs/operators";
import { Subscribable } from "recompose";

import { componentFromStream } from "@dcos/data-service";
import { DataLayerType, DataLayer } from "@extension-kid/data-layer";
import gql from "graphql-tag";

import JobsOverviewLoading from "./components/JobsOverviewLoading";
import JobsOverviewError from "./components/JobsOverviewError";
import JobsOverviewList from "./components/JobsOverviewList";
import JobsOverviewEmpty from "./components/JobsOverviewEmpty";

import container from "#SRC/js/container";

import { JobConnection } from "./types/JobConnection";

const dataLayer: DataLayer = container.get<DataLayer>(DataLayerType);

interface JobsOverviewProps {
  path: string[];
  router: InjectedRouter;
  location: LocationDescriptor;
  params: Router.Params;
}

const JobsOverview = withRouter(
  componentFromStream<JobsOverviewProps>(
    (
      props$: Subscribable<JobsOverviewProps>
    ): Subscribable<React.ReactNode> => {
      const jobsOverviewQuery: any = gql`
        query {
          jobs(
            path: $path
            filter: $filter
            sortBy: $sortBy
            sortDirection: $sortDirection
          ) {
            path
            filteredCount
            totalCount
            nodes
          }
        }
      `;

      const filter$ = new BehaviorSubject<string>("");
      const path$ = new BehaviorSubject<string[]>([]);

      (props$ as Observable<JobsOverviewProps>)
        .pipe(
          map(props => [
            props.params && props.params.path
              ? props.params.path.split(".")
              : [],
            props.location.query ? props.location.query.searchString : ""
          ])
        )
        .subscribe(([path, filter]) => {
          path$.next(path);

          filter$.next(filter);
        });

      const jobs$ = combineLatest(path$, filter$).pipe(
        sampleTime(250),
        switchMap(([path, filter]) => {
          return dataLayer.query(jobsOverviewQuery, {
            path,
            filter
          }) as Observable<{ data: { jobs: JobConnection } }>;
        }),
        map(data => data.data.jobs)
      );

      return combineLatest(filter$, jobs$, props$ as RxSubscribable<any>).pipe(
        map(([filter, jobs, props]) => {
          function handleFilterChange(filter: string) {
            const query = filter === "" ? {} : { searchString: filter };
            props.router.push({ pathname: props.location.pathname, query });

            filter$.next(filter);
          }

          if (jobs.totalCount > 0) {
            return (
              <JobsOverviewList
                data={jobs}
                filter={filter}
                handleFilterChange={handleFilterChange}
              />
            );
          }

          return (
            <JobsOverviewEmpty key={"JobsOverviewEmpty"} jobPath={jobs.path} />
          );
        }),
        startWith(<JobsOverviewLoading />),
        catchError(e => {
          // tslint:disable-next-line:no-console
          console.error(e);
          return of(<JobsOverviewError />);
        })
      );
    }
  )
);

export default JobsOverview;

import * as React from "react";
import Router, {
  InjectedRouter,
  LocationDescriptor,
  withRouter,
} from "react-router";
import {
  BehaviorSubject,
  Observable,
  Subscribable as RxSubscribable,
  combineLatest,
  of,
} from "rxjs";
import {
  map,
  sampleTime,
  switchMap,
  startWith,
  catchError,
  distinctUntilChanged,
} from "rxjs/operators";
import { Subscribable } from "recompose";
import isEqual from "lodash.isequal";

import { componentFromStream } from "@dcos/data-service";
import { DataLayerType, DataLayer } from "@extension-kid/data-layer";
import gql from "graphql-tag";

import Loader from "#SRC/js/components/Loader";
import JobsPage from "./components/JobsPage";
import JobsOverviewError from "./components/JobsOverviewError";
import JobsOverviewList from "./components/JobsOverviewList";

import container from "#SRC/js/container";

import { JobConnection } from "./types/JobConnection";

const dataLayer = container.get<DataLayer>(DataLayerType);

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
          map((props) => [
            props.params && props.params.path
              ? props.params.path.split(".")
              : [],
            props.location.query ? props.location.query.searchString : "",
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
            filter,
          }) as Observable<{ data: { jobs: JobConnection } }>;
        }),
        map((data) => data.data.jobs),
        distinctUntilChanged(isEqual)
      );

      // we assume here the router does not change
      const handleFilterChange$ = (props$ as any).pipe(
        distinctUntilChanged(
          (prevProps, nextProps) =>
            (prevProps as any).location.pathname ===
            (nextProps as any).location.pathname
        ),
        map((props) => (filter: string) => {
          const query = filter === "" ? {} : { searchString: filter };
          (props as any).router.push({
            pathname: (props as any).location.pathname,
            query,
          });

          filter$.next(filter);
        })
      );

      return combineLatest(
        filter$,
        jobs$,
        handleFilterChange$ as RxSubscribable<(filter: string) => void>
      ).pipe(
        map(([filter, jobs, handleFilterChange]) => {
          return (
            <JobsOverviewList
              data={jobs}
              filter={filter}
              handleFilterChange={handleFilterChange}
            />
          );
        }),
        startWith(
          <JobsPage>
            <Loader />
          </JobsPage>
        ),
        catchError((e) => {
          console.error(e);
          return of(<JobsOverviewError />);
        })
      );
    }
  )
);

export default JobsOverview;

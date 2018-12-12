import * as React from "react";
import Router, {
  InjectedRouter,
  LocationDescriptor,
  withRouter
} from "react-router";

import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable, Subscribable } from "rxjs/Observable";
import { combineLatest } from "rxjs/observable/combineLatest";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/of";
import "rxjs/add/operator/startWith";
import "rxjs/add/operator/sampleTime";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/map";

import { graphqlObservable, componentFromStream } from "@dcos/data-service";
import gql from "graphql-tag";

import JobsOverviewLoading from "./components/JobsOverviewLoading";
import JobsOverviewError from "./components/JobsOverviewError";
import JobsOverviewList from "./components/JobsOverviewList";
import JobsOverviewEmpty from "./components/JobsOverviewEmpty";

import JobModel from "./data/JobModel";
import { JobConnection } from "./types/JobConnection";

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
        .map(props => [
          props.params && props.params.path ? props.params.path.split(".") : [],
          props.location.query ? props.location.query.searchString : ""
        ])
        .subscribe(([path, filter]) => {
          path$.next(path);

          filter$.next(filter);
        });

      const jobs$ = combineLatest(path$, filter$)
        .sampleTime(250)
        .switchMap(([path, filter]) => {
          return graphqlObservable(jobsOverviewQuery, JobModel, {
            path,
            filter
          }) as Observable<{ data: { jobs: JobConnection } }>;
        })
        .map(data => data.data.jobs);

      return combineLatest(filter$, jobs$, props$)
        .map(([filter, jobs, props]) => {
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
        })
        .startWith(<JobsOverviewLoading />)
        .catch(e => {
          // tslint:disable-next-line:no-console
          console.error(e);
          return Observable.of(<JobsOverviewError />);
        });
    }
  )
);

export default JobsOverview;

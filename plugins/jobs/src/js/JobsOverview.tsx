import * as React from "react";
import Router, {
  InjectedRouter,
  LocationDescriptor,
  Link,
  withRouter
} from "react-router";

// tslint:disable-next-line:no-submodule-imports
import { BehaviorSubject } from "rxjs/BehaviorSubject";
// tslint:disable-next-line:no-submodule-imports
import "rxjs/add/observable/empty";

import { graphqlObservable, componentFromStream } from "data-service";
import gql from "graphql-tag";

// import JobsTabLoading from "./components/JobsTabLoading";
// import JobsTabError from "./components/JobsTabError";
// import JobsTabList from "./components/JobsTabList";
// import JobsTabEmpty from "./components/JobsTabEmpty";

import JobModel from "./data/JobModel";
import { combineLatest } from "rxjs/observable/combineLatest";
import { Observable, Subscribable } from "rxjs/Observable";
import { JobConnection } from "#PLUGINS/jobs/src/js/types/JobConnection";
import { Job } from "#PLUGINS/jobs/src/js/types/Job";

interface JobsOverviewProps {
  path: string[];
  router: InjectedRouter;
  location: LocationDescriptor;
  params: Router.Params;
}

/**
 * This Component is only to enable us to manually check the mediator,
 * everything should work as expected - but looks kinda rough :)
 *
 * It will removed and replaced by refactored UI components in the next PR.
 *
 * Features are:
 * - working input field
 * - working links for namespaces
 *
 * Known limitations:
 * - Links to job detail are disabled
 *
 * @param props object
 */
function DummyComponent(props: any): JSX.Element {
  function updateFilter(event: React.FormEvent<HTMLInputElement>) {
    props.handleFilterChange(event.currentTarget.value);
  }

  // tslint:disable-next-line:no-console
  console.log("rendering with props", props, props.pathname);

  return (
    <div style={{ background: "white", width: "100%" }}>
      <p>Path</p>
      <p>
        {props.data &&
          props.data.path.reduce(
            (acc: any[], val: string, idx: number) => {
              const link = (
                <Link
                  to={
                    "/jobs/overview/" +
                    props.data.path.slice(0, idx + 1).join(".")
                  }
                >
                  {val}
                </Link>
              );
              return acc.concat([" / ", link]);
            },
            [
              <Link key="Jobs" to={"/jobs/overview/"}>
                Jobs
              </Link>
            ]
          )}
      </p>
      <p>Filter</p>
      <input value={props.filter} onChange={updateFilter} />
      <p>Jobs</p>
      {props.data &&
        props.data.nodes.map((job: Job) => {
          const next = job.path
            .concat([job.name])
            .reduce<string[]>(
              (acc, val, idx) =>
                props.data.path[idx] === val ? acc : acc.concat([val]),
              []
            );
          return next.length > 1 ? (
            <p key={job.id}>
              <Link
                to={`/jobs/overview/${props.data.path
                  .concat([next.slice(0, 1)])
                  .join(".")}`}
              >{`link: ${next.slice(0, 1)}`}</Link>
            </p>
          ) : (
            <p key={job.id}>${next} (detail)</p>
          );
        })}
      <p>Children</p>
      <div>{props.children}</div>
    </div>
  );
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
          // tslint:disable-next-line:no-console
          console.log(`pushing to path$`, path);
          path$.next(path);

          // tslint:disable-next-line:no-console
          console.log(`pushing to filter$`, filter);
          filter$.next(filter);
        });

      const jobs$ = combineLatest(path$, filter$)
        .sampleTime(250)
        .switchMap(([path, filter]) => {
          // tslint:disable-next-line:no-console
          console.log(`requesting data with path: ${path} filter: ${filter}`);
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
              <DummyComponent
                name={"JobsTabList"}
                data={jobs}
                filter={filter}
                handleFilterChange={handleFilterChange}
              />
            );
          }

          return (
            <DummyComponent
              key="JobsTabEmpty"
              name={"JobsTabEmpty"}
              data={jobs}
              filter={filter}
              handleFilterChange={handleFilterChange}
            />
          );
        })
        .startWith(<DummyComponent name="JobsTabLoading" />)
        .catch(e => {
          // tslint:disable-next-line:no-console
          console.error(e);
          return Observable.of(<DummyComponent key="JobsTabError" />);
        });
    }
  )
);

export default JobsOverview;

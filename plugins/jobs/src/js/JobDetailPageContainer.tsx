import * as React from "react";
import { componentFromStream } from "@dcos/data-service";
import { of, combineLatest } from "rxjs";
import gql from "graphql-tag";
import {
  switchMap,
  map,
  distinctUntilChanged,
  catchError,
  startWith,
} from "rxjs/operators";
import { DataLayerType } from "@extension-kid/data-layer";

import container from "#SRC/js/container";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import JobDetailPage from "./pages/JobDetailPage";

const dataLayer = container.get(DataLayerType);

const LoadingScreen = () => (
  <Page>
    <Page.Header breadcrumbs={[]} />
    <Loader />
  </Page>
);

const ErrorScreen = () => (
  <Page>
    <Page.Header breadcrumbs={[]} />
    <RequestErrorMsg />
  </Page>
);

const getGraphQL = (id) =>
  dataLayer.query(
    gql`
      query {
        job(id: $id) {
          id
          name
          path
          command
          schedules
          cpus
          description
          mem
          docker
          disk
          labels
          jobRuns
          json
        }
      }
    `,
    { id }
  );

export default componentFromStream((props$) => {
  const job$ = props$.pipe(
    map((props) => props.params.id),
    distinctUntilChanged(),
    switchMap(getGraphQL),
    map((res) => res.data.job)
  );

  return combineLatest([job$, props$]).pipe(
    map(([job, props]) => {
      return <JobDetailPage {...props} job={job} errorMsg={null} />;
    }),
    catchError((e) => {
      console.log(e);
      return of(<ErrorScreen />);
    }),
    startWith(<LoadingScreen />)
  );
});

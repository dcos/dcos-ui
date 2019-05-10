import React from "react";
import { componentFromStream } from "@dcos/data-service";
import { getContext } from "recompose";
import { routerShape } from "react-router";
import { of, combineLatest, BehaviorSubject } from "rxjs";
import gql from "graphql-tag";
import {
  switchMap,
  map,
  distinctUntilChanged,
  catchError,
  startWith
} from "rxjs/operators";
import { DataLayerType } from "@extension-kid/data-layer";

import container from "#SRC/js/container";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import JobDetailPage from "./pages/JobDetailPage";

const dataLayer = container.get(DataLayerType);

export const DIALOGS = {
  EDIT: "edit",
  DESTROY: "destroy"
};

const LoadingScreen = function() {
  return (
    <Page>
      <Page.Header breadcrumbs={[]} />
      <Loader />
    </Page>
  );
};

const ErrorScreen = function() {
  return (
    <Page>
      <Page.Header breadcrumbs={[]} />
      <RequestErrorMsg />
    </Page>
  );
};

const disabledDialog$ = new BehaviorSubject(null);
const disableDialog = () => {
  disabledDialog$.next(DIALOGS.DESTROY);
};

const jobActionDialog$ = new BehaviorSubject(null);

const handleDestroyButtonClick = () => {
  jobActionDialog$.next(DIALOGS.DESTROY);
};

const handleEditButtonClick = () => {
  jobActionDialog$.next(DIALOGS.EDIT);
};

const closeDialog = () => {
  jobActionDialog$.next(null);
  disabledDialog$.next(null);
};

const getGraphQL = id =>
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

export default getContext({
  router: routerShape
})(
  componentFromStream(props$ => {
    const id$ = props$.pipe(
      map(props => props.params.id),
      distinctUntilChanged()
    );
    const job$ = id$.pipe(
      switchMap(id => getGraphQL(id)),
      map(({ data: { job } }) => job)
    );

    return combineLatest([
      job$,
      props$,
      jobActionDialog$,
      disabledDialog$
    ]).pipe(
      map(([job, { router, ...props }, jobActionDialog, disabledDialog]) => {
        function onJobDeleteSuccess() {
          router.push("/jobs");
          closeDialog();
        }

        return (
          <JobDetailPage
            {...props}
            job={job}
            jobActionDialog={jobActionDialog}
            disabledDialog={disabledDialog}
            errorMsg={null}
            handleDestroyButtonClick={handleDestroyButtonClick}
            handleEditButtonClick={handleEditButtonClick}
            onJobDeleteSuccess={onJobDeleteSuccess}
            closeDialog={closeDialog}
            disableDialog={disableDialog}
          />
        );
      }),
      catchError(() => of(<ErrorScreen />)),
      startWith(<LoadingScreen />)
    );
  })
);

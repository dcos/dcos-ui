import React from "react";
import { componentFromStream, graphqlObservable } from "data-service";
import { Observable, BehaviorSubject } from "rxjs";
import gql from "graphql-tag";
import { default as schema } from "#PLUGINS/jobs/src/js/data/JobModel";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import JobDetailPage from "./pages/JobDetailPage";

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
  graphqlObservable(
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
    schema,
    { id }
  );

export default componentFromStream(props$ => {
  const id$ = props$.map(props => props.params.id).distinctUntilChanged();
  const job$ = id$
    .switchMap(id => getGraphQL(id))
    .map(({ data: { job } }) => job);

  return Observable.combineLatest([
    job$,
    props$,
    jobActionDialog$,
    disabledDialog$
  ])
    .map(([job, props, jobActionDialog, disabledDialog]) => (
      <JobDetailPage
        {...props}
        job={job}
        jobActionDialog={jobActionDialog}
        disabledDialog={disabledDialog}
        errorMsg={null}
        handleRunNowButtonClick={() => {}}
        handleDisableScheduleButtonClick={() => {}}
        handleEnableScheduleButtonClick={() => {}}
        handleAcceptDestroyDialog={() => {}}
        handleDestroyButtonClick={handleDestroyButtonClick}
        handleEditButtonClick={handleEditButtonClick}
        closeDialog={closeDialog}
        disableDialog={disableDialog}
      />
    ))
    .catch(() => Observable.of(<ErrorScreen />))
    .startWith(<LoadingScreen />);
});

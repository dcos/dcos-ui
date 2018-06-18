import React from "react";
import { componentFromStream, graphqlObservable } from "data-service";
import { Observable, BehaviorSubject } from "rxjs";
import gql from "graphql-tag";
import { default as schema } from "#PLUGINS/jobs/src/js/data/JobModel";
import Loader from "../../components/Loader";
import Page from "../../components/Page";
import RequestErrorMsg from "../../components/RequestErrorMsg";
import MetronomeStore from "../../stores/MetronomeStore";
import JobDetailPage from "./JobDetailPage";

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
    .map(([job, props, jobActionDialog, disabledDialog]) => {
      const enhancedProps = {
        ...props,
        job,
        jobActionDialog,
        disabledDialog,
        errorMsg: null,
        handleRunNowButtonClick() {
          MetronomeStore.runJob(job.id);
        },
        handleDisableScheduleButtonClick() {
          MetronomeStore.toggleSchedule(job.id, false);
        },
        handleEnableScheduleButtonClick() {
          MetronomeStore.toggleSchedule(job.id, true);
        },
        handleAcceptDestroyDialog(stopCurrentJobRuns = false) {
          MetronomeStore.deleteJob(job.id, stopCurrentJobRuns);
        },
        handleDestroyButtonClick,
        handleEditButtonClick,
        closeDialog,
        disableDialog
      };

      return <JobDetailPage {...enhancedProps} />;
    })
    .catch(() => Observable.of(<ErrorScreen />))
    .startWith(<LoadingScreen />);
});

import React from "react";
import { componentFromStream, graphqlObservable } from "data-service";
import { Observable, BehaviorSubject } from "rxjs";
import gql from "graphql-tag";
import { default as schema } from "#PLUGINS/jobs/src/js/data/JobModel";
import JobsBreadcrumbs from "#PLUGINS/jobs/src/js/components/JobsBreadcrumbs";
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
  // TODO: fix breadcrumbs
  return (
    <Page>
      {/* <Page.Header breadcrumbs={[]} /> */}
      <Loader />
    </Page>
  );
};

const ErrorScreen = function() {
  // TODO: fix breadcrumbs
  return (
    <Page>
      {/* <Page.Header breadcrumbs={[]} /> */}
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

const getInput$ = id =>
  graphqlObservable(
    gql`
query {
  job(id: "${id}") {
    id
    name
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
    {}
  );

export default componentFromStream(props$ => {
  const id$ = props$
    .map(props => props.params.id)
    .distinctUntilChanged()
    .do(x => console.log(x));
  const jobs$ = id$
    .switchMap(id => getInput$(id))
    .do(x => console.log(x))
    .map(({ data: { job } }) => job)
    .do(x => console.log(x));

  return Observable.combineLatest([
    jobs$,
    props$,
    jobActionDialog$,
    disabledDialog$
  ])
    .do(x => console.log(x))
    .map(([job, props, jobActionDialog, disabledDialog]) => {
      // if (job == null) {
      //   return <LoadingScreen />;
      // }

      console.log("JobDetailPagContainer", job);

      props = {
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

      return <JobDetailPage {...props} />;
    })
    .do(x => console.log(x))
    .catch(error => {
      console.error(error);

      return Observable.of(<ErrorScreen />);
    })
    .startWith(<LoadingScreen />)
    .do(x => console.log(x));
});

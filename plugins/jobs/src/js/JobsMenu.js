/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import { componentFromStream } from "data-service";
import "rxjs/add/operator/combineLatest";

import Page from "#SRC/js/components/Page";
import JobsBreadcrumbs from "./components/JobsBreadcrumbs";
import { jobsRunNowAction, jobsRunNow$ } from "./JobsRunNow";

const getActions = function(props) {
  const [edit, ...rest] = props.actions;
  const newActions = [];

  newActions.push(edit);

  newActions.push(jobsRunNowAction(props.job.getId()));

  return newActions.concat(rest);
};

const JobsMenu = componentFromStream(props$ => {
  return props$.combineLatest(jobsRunNow$.startWith({}), props => {
    return (
      <Page.Header
        actions={getActions(props)}
        breadcrumbs={<JobsBreadcrumbs tree={props.tree} item={props.job} />}
        tabs={props.tabs}
        isPageHeader={props.isPageHeader}
      />
    );
  });
});

export default JobsMenu;

import React from "react";

import TaskDetail
  from "../../../../plugins/services/src/js/pages/task-details/TaskDetail";
import MesosStateStore from "../../stores/MesosStateStore";
import JobsBreadcrumbs from "../../components/breadcrumbs/JobsBreadcrumbs";
import Page from "../../components/Page";

const dontScrollRoutes = [/\/files\/view.*$/, /\/logs.*$/];

class JobTaskDetailPage extends React.Component {
  render() {
    const { location, params, routes } = this.props;
    const { id, taskID } = params;

    const routePrefix = `/jobs/${encodeURIComponent(id)}/tasks/${encodeURIComponent(taskID)}`;
    const tabs = [
      { label: "Details", routePath: routePrefix + "/details" },
      { label: "Files", routePath: routePrefix + "/files" },
      { label: "Logs", routePath: routePrefix + "/logs" }
    ];

    const task = MesosStateStore.getTaskFromTaskID(taskID);

    let breadcrumbs;
    if (task != null) {
      breadcrumbs = (
        <JobsBreadcrumbs
          jobID={id}
          taskID={task.getId()}
          taskName={task.getName()}
        />
      );
    } else {
      breadcrumbs = <JobsBreadcrumbs />;
    }

    const dontScroll = dontScrollRoutes.some(regex => {
      return regex.test(location.pathname);
    });

    return (
      <Page dontScroll={dontScroll}>
        <Page.Header breadcrumbs={breadcrumbs} tabs={tabs} iconID="jobs" />
        <TaskDetail params={params} routes={routes}>
          {this.props.children}
        </TaskDetail>
      </Page>
    );
  }
}

JobTaskDetailPage.propTypes = {
  params: React.PropTypes.object,
  routes: React.PropTypes.array
};

module.exports = JobTaskDetailPage;

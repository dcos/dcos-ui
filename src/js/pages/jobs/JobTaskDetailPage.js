import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router";

import DCOSStore from "#SRC/js/stores/DCOSStore";

import TaskDetail from "#PLUGINS/services/src/js/pages/task-details/TaskDetail";
import JobsBreadcrumbs from "../../components/JobsBreadcrumbs";

import MesosStateStore from "../../stores/MesosStateStore";
import MetronomeStore from "../../stores/MetronomeStore";
import Page from "../../components/Page";
import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";

const dontScrollRoutes = [/\/files\/view.*$/, /\/logs.*$/];

class JobTaskDetailPage extends React.Component {
  render() {
    const { location, params, routes } = this.props;
    const { id, taskID } = params;

    const routePrefix = `/jobs/detail/${encodeURIComponent(
      id
    )}/tasks/${encodeURIComponent(taskID)}`;
    const tabs = [
      { label: "Details", routePath: routePrefix + "/details" },
      { label: "Files", routePath: routePrefix + "/files" },
      { label: "Logs", routePath: routePrefix + "/logs" }
    ];

    const job = MetronomeStore.getJob(id);
    const task = MesosStateStore.getTaskFromTaskID(taskID);

    let breadcrumbs = (
      <JobsBreadcrumbs tree={DCOSStore.jobTree} item={job} details={false} />
    );

    if (task != null) {
      breadcrumbs = (
        <JobsBreadcrumbs tree={DCOSStore.jobTree} item={job} details={false}>
          <Breadcrumb key="task-name" title={task.getName()}>
            <BreadcrumbTextContent>
              <Link to={`/jobs/detail/${id}/tasks/${task.getId()}`}>
                {task.getName()}
              </Link>
            </BreadcrumbTextContent>
          </Breadcrumb>
        </JobsBreadcrumbs>
      );
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
  params: PropTypes.object,
  routes: PropTypes.array
};

module.exports = JobTaskDetailPage;

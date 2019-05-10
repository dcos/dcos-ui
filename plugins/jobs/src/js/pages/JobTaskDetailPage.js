import PropTypes from "prop-types";
import React from "react";
import { Link } from "react-router";
import { i18nMark } from "@lingui/react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import Page from "#SRC/js/components/Page";
import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";

import TaskDetail from "#PLUGINS/services/src/js/pages/task-details/TaskDetail";
import Breadcrumbs from "../components/Breadcrumbs";

const dontScrollRoutes = [/\/files\/view.*$/, /\/logs.*$/];

class JobTaskDetailPage extends React.Component {
  render() {
    const { location, params, routes } = this.props;
    const { id, taskID } = params;

    const routePrefix = `/jobs/detail/${encodeURIComponent(
      id
    )}/tasks/${encodeURIComponent(taskID)}`;
    const tabs = [
      { label: i18nMark("Details"), routePath: routePrefix + "/details" },
      { label: i18nMark("Files"), routePath: routePrefix + "/files" },
      { label: i18nMark("Logs"), routePath: routePrefix + "/logs" }
    ];

    const task = MesosStateStore.getTaskFromTaskID(taskID);
    const breadcrumbs = (
      <Breadcrumbs>
        {task ? (
          <Breadcrumb key="task-name" title={task.getName()}>
            <BreadcrumbTextContent>
              <Link to={`/jobs/detail/${id}/tasks/${task.getId()}`}>
                {task.getName()}
              </Link>
            </BreadcrumbTextContent>
          </Breadcrumb>
        ) : null}
      </Breadcrumbs>
    );

    const dontScroll = dontScrollRoutes.some(regex => {
      return regex.test(location.pathname);
    });

    return (
      <Page dontScroll={dontScroll}>
        <Page.Header
          breadcrumbs={breadcrumbs}
          tabs={tabs}
          iconID={ProductIcons.Jobs}
        />
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

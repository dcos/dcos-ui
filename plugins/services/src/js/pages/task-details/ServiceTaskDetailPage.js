import PropTypes from "prop-types";
import React from "react";
import { i18nMark } from "@lingui/react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import Page from "#SRC/js/components/Page";

import TaskDetail from "./TaskDetail";
import ServiceBreadcrumbs from "../../components/ServiceBreadcrumbs";

const dontScrollRoutes = [/\/files\/view.*$/, /\/logs.*$/];

const ServiceTaskDetailPage = props => {
  const { location, params, routes } = props;
  const { id, taskID } = params;

  const routePrefix = `/services/detail/${encodeURIComponent(
    id
  )}/tasks/${encodeURIComponent(taskID)}`;
  const tabs = [
    { label: i18nMark("Details"), routePath: routePrefix + "/details" },
    { label: i18nMark("Files"), routePath: routePrefix + "/files" },
    { label: i18nMark("Logs"), routePath: routePrefix + "/logs" }
  ];

  const task = MesosStateStore.getTaskFromTaskID(taskID);
  let breadcrumbs;
  if (task != null) {
    breadcrumbs = (
      <ServiceBreadcrumbs
        serviceID={id}
        taskID={task.getId()}
        taskName={task.getName()}
      />
    );
  } else {
    breadcrumbs = <ServiceBreadcrumbs serviceID={id} />;
  }

  const dontScroll = dontScrollRoutes.some(regex =>
    regex.test(location.pathname)
  );

  return (
    <Page dontScroll={dontScroll}>
      <Page.Header
        breadcrumbs={breadcrumbs}
        tabs={tabs}
        iconID={ProductIcons.Services}
      />
      <TaskDetail params={params} routes={routes}>
        {props.children}
      </TaskDetail>
    </Page>
  );
};

ServiceTaskDetailPage.propTypes = {
  params: PropTypes.object,
  routes: PropTypes.array
};

module.exports = ServiceTaskDetailPage;

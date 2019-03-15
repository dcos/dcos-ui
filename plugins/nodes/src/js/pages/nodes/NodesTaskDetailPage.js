import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";
import { i18nMark } from "@lingui/react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import Page from "#SRC/js/components/Page";

import TaskDetail from "../../../../../services/src/js/pages/task-details/TaskDetail";
import NodeBreadcrumbs from "../../components/NodeBreadcrumbs";

const dontScrollRoutes = [/\/files\/view.*$/, /\/logs.*$/];

class NodesTaskDetailPage extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: "summary",
        events: ["success"],
        listenAlways: false
      }
    ];
  }

  render() {
    const { location, params, routes } = this.props;
    const { nodeID, taskID } = params;

    const routePrefix = `/nodes/${encodeURIComponent(
      nodeID
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
        <NodeBreadcrumbs
          nodeID={nodeID}
          taskID={task.getId()}
          taskName={task.getName()}
        />
      );
    } else {
      breadcrumbs = <NodeBreadcrumbs nodeID={nodeID} />;
    }

    const dontScroll = dontScrollRoutes.some(regex => {
      return regex.test(location.pathname);
    });

    return (
      <Page dontScroll={dontScroll}>
        <Page.Header
          breadcrumbs={breadcrumbs}
          tabs={tabs}
          iconID={ProductIcons.Servers}
        />
        <TaskDetail params={params} routes={routes}>
          {this.props.children}
        </TaskDetail>
      </Page>
    );
  }
}

NodesTaskDetailPage.propTypes = {
  params: PropTypes.object,
  routes: PropTypes.array
};

export default NodesTaskDetailPage;

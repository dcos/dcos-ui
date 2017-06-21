import mixin from "reactjs-mixin";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";

import TaskDetail
  from "../../../../../services/src/js/pages/task-details/TaskDetail";
import MesosStateStore from "../../../../../../src/js/stores/MesosStateStore";
import NodeBreadcrumbs from "../../components/NodeBreadcrumbs";
import Page from "../../../../../../src/js/components/Page";

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

    const routePrefix = `/nodes/${encodeURIComponent(nodeID)}/tasks/${encodeURIComponent(taskID)}`;
    const tabs = [
      { label: "Details", routePath: routePrefix + "/details" },
      { label: "Files", routePath: routePrefix + "/files" },
      { label: "Logs", routePath: routePrefix + "/logs" }
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
        <Page.Header breadcrumbs={breadcrumbs} tabs={tabs} iconID="servers" />
        <TaskDetail params={params} routes={routes}>
          {this.props.children}
        </TaskDetail>
      </Page>
    );
  }
}

NodesTaskDetailPage.propTypes = {
  params: React.PropTypes.object,
  routes: React.PropTypes.array
};

module.exports = NodesTaskDetailPage;

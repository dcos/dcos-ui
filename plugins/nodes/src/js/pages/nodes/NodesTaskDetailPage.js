import React from 'react';

import TaskDetail from '../../../../../services/src/js/pages/task-details/TaskDetail';
import MesosStateStore from '../../../../../../src/js/stores/MesosStateStore';
import NodeBreadcrumbs from '../../components/NodeBreadcrumbs';
import Page from '../../../../../../src/js/components/Page';

class NodesTaskDetailPage extends React.Component {
  render() {
    const {params, routes} = this.props;
    const {nodeID, taskID} = params;

    let routePrefix = `/nodes/${encodeURIComponent(nodeID)}/tasks/${encodeURIComponent(taskID)}`;
    const tabs = [
      {label: 'Details', routePath: routePrefix + '/details'},
      {label: 'Files', routePath: routePrefix + '/files'},
      {label: 'Logs', routePath: routePrefix + '/logs'}
    ];

    let task = MesosStateStore.getTaskFromTaskID(taskID);
    let breadcrumbs;
    if (task != null) {
      breadcrumbs = (
        <NodeBreadcrumbs
          nodeID={nodeID}
          taskID={task.getId()}
          taskName={task.getName()}/>
      );
    } else {
      breadcrumbs = <NodeBreadcrumbs nodeID={nodeID} />;
    }

    return (
      <Page>
        <Page.Header
          breadcrumbs={breadcrumbs}
          tabs={tabs}
          iconID="servers" />
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

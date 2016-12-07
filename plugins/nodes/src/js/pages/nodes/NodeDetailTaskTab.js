import React from 'react';
import {routerShape} from 'react-router';

import NodeBreadcrumbs from '../../components/NodeBreadcrumbs';

import MesosStateStore from '../../../../../../src/js/stores/MesosStateStore';
import Node from '../../../../../../src/js/structs/Node';
import Page from '../../../../../../src/js/components/Page';
import TasksContainer from '../../../../../services/src/js/containers/tasks/TasksContainer';

class NodeDetailTaskTab extends React.Component {
  render() {

    let {nodeID} = this.props.params;
    let tasks = MesosStateStore.getTasksFromNodeID(nodeID);

    return (
      <Page>
        <Page.Header breadcrumbs={<NodeBreadcrumbs nodeID={nodeID} />} />
        <TasksContainer
          params={this.props.params}
          tasks={tasks} />
      </Page>
    );
  }
}

NodeDetailTaskTab.contextTypes = {
  router: routerShape
};

NodeDetailTaskTab.propTypes = {
  node: React.PropTypes.instanceOf(Node).isRequired
};

module.exports = NodeDetailTaskTab;

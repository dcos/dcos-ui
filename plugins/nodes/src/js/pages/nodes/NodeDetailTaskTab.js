import React from 'react';
import {routerShape} from 'react-router';

import MesosStateStore from '../../../../../../src/js/stores/MesosStateStore';
import Node from '../../../../../../src/js/structs/Node';
import TasksContainer from '../../../../../services/src/js/containers/tasks/TasksContainer';

class NodeDetailTaskTab extends React.Component {
  render() {
    let nodeID = this.props.node.getID();
    let tasks = MesosStateStore.getTasksFromNodeID(nodeID);

    return (
      <TasksContainer
        params={this.props.params}
        tasks={tasks} />
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

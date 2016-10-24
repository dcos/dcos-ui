import React from 'react';

import MesosStateStore from '../../../../../../src/js/stores/MesosStateStore';
import Node from '../../../../../../src/js/structs/Node';
import TasksContainer from '../../../../../services/src/js/tasks/TasksContainer';

class NodeDetailTaskTab extends React.Component {
  render() {
    let nodeID = this.props.node.getID();
    let tasks = MesosStateStore.getTasksFromNodeID(nodeID);

    return <TasksContainer tasks={tasks} />;
  }
}

NodeDetailTaskTab.contextTypes = {
  router: React.PropTypes.func
};

NodeDetailTaskTab.propTypes = {
  node: React.PropTypes.instanceOf(Node).isRequired
};

module.exports = NodeDetailTaskTab;

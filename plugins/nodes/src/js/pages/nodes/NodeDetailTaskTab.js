import React from 'react';

import MesosStateStore from '../../../../../../src/js/stores/MesosStateStore';
import Node from '../../../../../../src/js/structs/Node';
import TaskView from '../../../../../services/src/js/components/TaskView';

class NodeDetailTaskTab extends React.Component {
  render() {
    let nodeID = this.props.node.getID();
    let tasks = MesosStateStore.getTasksFromNodeID(nodeID);

    return (
      <TaskView
        tasks={tasks}
        parentRouter={this.context.router}
        nodeID={nodeID} />
    );
  }
}

NodeDetailTaskTab.contextTypes = {
  router: React.PropTypes.func
};

NodeDetailTaskTab.propTypes = {
  node: React.PropTypes.instanceOf(Node).isRequired
};

module.exports = NodeDetailTaskTab;

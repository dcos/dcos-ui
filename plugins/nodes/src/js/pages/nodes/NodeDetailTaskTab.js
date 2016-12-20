import React from 'react';
import {routerShape} from 'react-router';

import MesosStateStore from '../../../../../../src/js/stores/MesosStateStore';
import TasksContainer from '../../../../../services/src/js/containers/tasks/TasksContainer';

class NodeDetailTaskTab extends React.Component {
  render() {

    const {nodeID} = this.props.params;
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

module.exports = NodeDetailTaskTab;

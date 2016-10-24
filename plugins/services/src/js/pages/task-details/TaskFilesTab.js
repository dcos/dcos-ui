import React from 'react';

import TaskDirectoryTable from '../../components/TaskDirectoryTable';
import TaskDirectoryStore from '../../stores/TaskDirectoryStore';

class TaskFilesTab extends React.Component {
  handleFileClick(path) {
    TaskDirectoryStore.addPath(this.props.task, path);
  }

  render() {
    let {props} = this;

    return (
      <div className="side-panel-section flex-container-col flex-grow">
        <TaskDirectoryTable
          files={props.directory.getItems()}
          onFileClick={this.handleFileClick.bind(this)}
          onOpenLogClick={props.onOpenLogClick}
          nodeID={props.task.slave_id} />
      </div>
    );
  }
}

TaskFilesTab.propTypes = {
  directory: React.PropTypes.object,
  task: React.PropTypes.object
};

TaskFilesTab.defaultProps = {
  task: {}
};

module.exports = TaskFilesTab;

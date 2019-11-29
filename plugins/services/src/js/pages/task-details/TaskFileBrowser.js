import PropTypes from "prop-types";
import React from "react";

import TaskDirectoryTable from "../../components/TaskDirectoryTable";
import TaskDirectoryStore from "../../stores/TaskDirectoryStore";

const METHODS_TO_BIND = ["handleFileClick"];

class TaskFileBrowser extends React.Component {
  constructor(...args) {
    super(...args);

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleFileClick(path) {
    TaskDirectoryStore.addPath(this.props.task, path);
  }

  render() {
    const { directory, onOpenLogClick, task } = this.props;

    return (
      <TaskDirectoryTable
        files={directory.getItems()}
        onFileClick={this.handleFileClick}
        onOpenLogClick={onOpenLogClick}
        nodeID={task.slave_id}
      />
    );
  }
}

TaskFileBrowser.propTypes = {
  directory: PropTypes.object,
  task: PropTypes.object
};

TaskFileBrowser.defaultProps = {
  task: {}
};

export default TaskFileBrowser;

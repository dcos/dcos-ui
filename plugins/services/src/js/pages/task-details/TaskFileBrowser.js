/* @flow */
import React from "react";

import TaskDirectoryTable from "../../components/TaskDirectoryTable";
import TaskDirectoryStore from "../../stores/TaskDirectoryStore";

const METHODS_TO_BIND = ["handleFileClick"];

type Props = {
  directory?: Object,
  task?: Object,
};

class TaskFileBrowser extends React.Component {
  constructor() {
    super(...arguments);

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

TaskFileBrowser.defaultProps = {
  task: {}
};

module.exports = TaskFileBrowser;

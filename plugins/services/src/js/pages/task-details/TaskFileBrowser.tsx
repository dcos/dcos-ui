import PropTypes from "prop-types";
import * as React from "react";

import TaskDirectoryTable from "../../components/TaskDirectoryTable";
import TaskDirectoryStore from "../../stores/TaskDirectoryStore";

class TaskFileBrowser extends React.Component {
  static defaultProps = {
    task: {}
  };
  static propTypes = {
    directory: PropTypes.object,
    task: PropTypes.object
  };
  constructor(...args) {
    super(...args);
  }
  handleFileClick = path => {
    TaskDirectoryStore.addPath(this.props.task, path);
  };

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

export default TaskFileBrowser;

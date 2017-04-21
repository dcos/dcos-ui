import React from "react";

class TaskFilesTab extends React.Component {
  render() {
    const { children, directory, onOpenLogClick, task } = this.props;

    return (
      <div className="flex flex-direction-top-to-bottom flex-item-grow-1 flex-item-shrink-1">
        {children &&
          React.cloneElement(children, {
            directory,
            task,
            onOpenLogClick
          })}
      </div>
    );
  }
}

TaskFilesTab.propTypes = {
  children: React.PropTypes.node,
  directory: React.PropTypes.object,
  task: React.PropTypes.object
};

TaskFilesTab.defaultProps = {
  task: {}
};

module.exports = TaskFilesTab;

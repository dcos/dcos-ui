/* @flow */
import React from "react";

type Props = {
  children?: number | string | React.Element | Array<any>,
  directory?: Object,
  task?: Object,
};

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

TaskFilesTab.defaultProps = {
  task: {}
};

module.exports = TaskFilesTab;

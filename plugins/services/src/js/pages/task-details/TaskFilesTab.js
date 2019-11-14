import PropTypes from "prop-types";
import React from "react";

const TaskFilesTab = props => {
  const { children, directory, onOpenLogClick, task } = props;

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
};

TaskFilesTab.propTypes = {
  children: PropTypes.node,
  directory: PropTypes.object,
  task: PropTypes.object
};

TaskFilesTab.defaultProps = {
  task: {}
};

module.exports = TaskFilesTab;

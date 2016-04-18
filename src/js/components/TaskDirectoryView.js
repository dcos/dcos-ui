import React from 'react';

import TaskDirectoryTable from './TaskDirectoryTable';
import TaskDirectoryStore from '../stores/TaskDirectoryStore';

class TaskDirectoryView extends React.Component {
  handleFileClick(path) {
    TaskDirectoryStore.addPath(this.props.task, path);
  }

  handleBreadcrumbClick(path) {
    TaskDirectoryStore.setPath(this.props.task, path);
  }

  getBreadcrumbs() {
    let innerPath = TaskDirectoryStore.get('innerPath').split('/');
    let onClickPath = '';

    let crumbs = innerPath.map((directoryItem, index) => {
      let textValue = directoryItem;
      let icon = (
        <i
          className="
            icon
            icon-sprite
            icon-sprite-small
            icon-back
            forward">
        </i>
      );

      // First breadcrumb is always 'Working Directory'.
      if (index === 0) {
        textValue = 'Working Directory';
        icon = null;
      } else {
        // Build the path that the user goes to if clicked.
        onClickPath += ('/' + directoryItem);
      }

      // Last breadcrumb. Don't make it a link.
      if (index === innerPath.length - 1) {
        return (
          <span key={index}>
            {icon}
            <span className="crumb" key={index}>{textValue}</span>
          </span>
        );
      }

      return (
        <span key={index}>
          {icon}
          <a
            className="crumb clickable"
            onClick={this.handleBreadcrumbClick.bind(this, onClickPath)}>
            {textValue}
          </a>
        </span>
      );
    });

    return (
      <h3 className="breadcrumbs flush-top">{crumbs}</h3>
    );
  }

  render() {
    let {props} = this;

    return (
      <div className="side-panel-section flex-container-col flex-grow">
        <div className="flex-box control-group">
          {this.getBreadcrumbs()}
        </div>
        <TaskDirectoryTable
          files={props.directory.getItems()}
          onFileClick={this.handleFileClick.bind(this)}
          onOpenLogClick={props.onOpenLogClick}
          nodeID={props.task.slave_id} />
      </div>
    );
  }
}

TaskDirectoryView.propTypes = {
  directory: React.PropTypes.object,
  task: React.PropTypes.object
};

TaskDirectoryView.defaultProps = {
  task: {}
};

module.exports = TaskDirectoryView;

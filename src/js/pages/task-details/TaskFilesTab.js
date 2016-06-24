import React from 'react';

import ManualBreadcrumbs from '../../components/ManualBreadcrumbs';
import TaskDirectoryTable from '../../components/TaskDirectoryTable';
import TaskDirectoryStore from '../../stores/TaskDirectoryStore';

const METHODS_TO_BIND = ['handleBreadcrumbClick']

class TaskFilesTab extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }
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

      // First breadcrumb is always 'Working Directory'.
      if (index === 0) {
        textValue = 'Working Directory';
      } else {
        onClickPath += ('/' + directoryItem);
      }

      return {
        className: 'clickable',
        label: textValue,
        onClick: this.handleBreadcrumbClick.bind(this, onClickPath)
      };
    });

    return (
      <ManualBreadcrumbs crumbs={crumbs} />
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

TaskFilesTab.propTypes = {
  directory: React.PropTypes.object,
  task: React.PropTypes.object
};

TaskFilesTab.defaultProps = {
  task: {}
};

module.exports = TaskFilesTab;

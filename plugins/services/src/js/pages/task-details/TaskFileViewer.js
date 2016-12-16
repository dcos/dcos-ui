import classNames from 'classnames';
import {Dropdown, Tooltip} from 'reactjs-components';
import React from 'react';
import {routerShape, formatPattern} from 'react-router';

import DirectoryItem from '../../structs/DirectoryItem';
import Icon from '../../../../../../src/js/components/Icon';
import MesosLogView from '../../components/MesosLogView';
import SearchLog from '../../components/SearchLog';
import TaskDirectoryActions from '../../events/TaskDirectoryActions';
import RouterUtil from '../../../../../../src/js/utils/RouterUtil';

class TaskFileViewer extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {currentFile: null};
  }

  shouldComponentUpdate(nextProps, nextState) {
    let {props, state} = this;
    let directory = props.directory;
    let nextDirectory = nextProps.directory;
    let task = state.task;
    let nextTask = nextState.task;

    return !!(
      // Check task
      (props.task !== nextProps.task) ||
      (task && nextTask && task.slave_id !== nextTask.slave_id) ||
      // Check current view
      (state.currentFile !== nextState.currentFile) ||
      // Check directory
      (directory !== nextDirectory) || (directory && nextDirectory &&
        directory.getItems().length !== nextDirectory.getItems().length)
    );
  }

  handleViewChange(currentFile) {
    let {params, routes} = this.props;
    let path = currentFile.get('path');
    if (path === this.getSelectedFile().get('path')) {
      // File path didn't change, let's not try to update path
      return;
    }

    let routePath = RouterUtil.reconstructPathFromRoutes(routes);
    this.context.router.push(formatPattern(
      routePath,
      Object.assign({}, params, {filePath: encodeURIComponent(path)})
    ));
  }

  getLogFiles() {
    let {directory} = this.props;
    let logViews = [];
    if (!directory) {
      return logViews;
    }

    directory.getItems().forEach((item) => {
      if (!item.isLogFile()) {
        return;
      }

      logViews.push(item);
    });

    return logViews;
  }

  getLogSelectionAsButtons(logFiles, selectedName) {
    let buttons = logFiles.map((item, index) => {
      let name = item.getName();

      let classes = classNames({
        'button button-stroke': true,
        'active': name === selectedName
      });

      return (
        <button
          className={classes}
          key={index}
          onClick={this.handleViewChange.bind(this, item)}>
          {item.getDisplayName()}
        </button>
      );
    });

    return (
      <div key="button-group" className="button-group">
        {buttons}
      </div>
    );
  }

  onItemSelection(obj) {
    this.handleViewChange(obj.value);
  }

  getItemHtml(displayName) {
    return (
      <span className="flush dropdown-header">{displayName}</span>
    );
  }

  getDropdownItems(logFiles) {
    return logFiles.map(function (item) {
      let displayName = item.getDisplayName();
      let selectedHtml = this.getItemHtml(displayName);
      let dropdownHtml = (<a>{selectedHtml}</a>);

      return {
        id: item.getName(),
        name: displayName,
        html: dropdownHtml,
        selectedHtml,
        value: item
      };
    }, this);
  }

  getSelectedFile() {
    let {props, state} = this;
    let file = state.currentFile;
    let paramsPath = decodeURIComponent(props.params.filePath);
    if (!file && paramsPath !== 'undefined') {
      return new DirectoryItem({path: paramsPath});
    }

    let files = this.getLogFiles();

    return files.find(function (file) {
      return file.getName() === 'stdout';
    }) || files[0];
  }

  getSelectionComponent(selectedLogFile) {
    let selectedName = selectedLogFile && selectedLogFile.getName();
    let logFiles = this.getLogFiles();
    if (logFiles.length < 3) {
      return this.getLogSelectionAsButtons(logFiles, selectedName);
    }

    return (
      <Dropdown
        key="dropdown"
        buttonClassName="button dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        initialID={selectedName}
        items={this.getDropdownItems(logFiles)}
        onItemSelection={this.onItemSelection.bind(this)}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
        wrapperClassName="dropdown form-group" />
    );
  }

  getActions(selectedLogFile, filePath) {
    let {task} = this.props;

    return [
      this.getSelectionComponent(selectedLogFile),
      <Tooltip key="tooltip" anchor="end" content={'Download log file'}>
        <a
          className="button button-stroke"
          disabled={!filePath}
          href=
            {TaskDirectoryActions.getDownloadURL(task.slave_id, filePath)}>
          <Icon id="download" size="mini" />
        </a>
      </Tooltip>
    ];
  }

  render() {
    let {task} = this.props;

    // Only try to get path if file exists
    let selectedLogFile = this.getSelectedFile();
    let selectedName = selectedLogFile && selectedLogFile.getName();
    let filePath = selectedLogFile && selectedLogFile.get('path');

    return (
      <SearchLog actions={this.getActions(selectedLogFile, filePath)}>
        <MesosLogView
          filePath={filePath}
          task={task}
          logName={selectedName} />
      </SearchLog>
    );
  }
}

TaskFileViewer.contextTypes = {
  router: routerShape
};

TaskFileViewer.defaultProps = {
  task: {}
};

TaskFileViewer.propTypes = {
  directory: React.PropTypes.object,
  selectedLogFile: React.PropTypes.object,
  task: React.PropTypes.object
};

module.exports = TaskFileViewer;

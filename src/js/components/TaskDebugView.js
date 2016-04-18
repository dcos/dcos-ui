import classNames from 'classnames';
import {Dropdown} from 'reactjs-components';
import React from 'react';

import FilterInputText from './FilterInputText';
import IconDownload from './icons/IconDownload';
import MesosLogView from './MesosLogView';
import TaskDirectoryActions from '../events/TaskDirectoryActions';

const METHODS_TO_BIND = ['handleSearchStringChange'];

class TaskDebugView extends React.Component {
  constructor() {
    super();

    this.state = {currentFile: null};

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

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
      // Check searchString
      (state.searchString !== nextState.searchString) ||
      // Check directory
      (directory !== nextDirectory) || (directory && nextDirectory &&
        directory.getItems().length !== nextDirectory.getItems().length)
    );
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString});
  }

  handleViewChange(currentFile) {
    this.setState({currentFile});
  }

  getLogView(logName, filePath, task) {
    let {state} = this;

    return (
      <MesosLogView
        filePath={filePath}
        highlightText={state.searchString}
        task={task}
        logName={logName} />
    );
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
      <div className="button-group">
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
    return state.currentFile ||
      props.selectedLogFile || this.getLogFiles()[0];
  }

  getSelectionComponent() {
    let selectedLogFile = this.getSelectedFile();
    let selectedName = selectedLogFile && selectedLogFile.getName();
    let logFiles = this.getLogFiles();
    if (logFiles.length < 4) {
      return this.getLogSelectionAsButtons(logFiles, selectedName);
    }

    return (
      <Dropdown
        buttonClassName="button dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        initialID={selectedName}
        items={this.getDropdownItems(logFiles)}
        onItemSelection={this.onItemSelection.bind(this)}
        transition={true}
        transitionName="dropdown-menu"
        wrapperClassName="dropdown form-group" />
      );
  }

  render() {
    let task = this.props.task;

    // Only try to get path if file exists
    let selectedLogFile = this.getSelectedFile();
    let selectedName = selectedLogFile && selectedLogFile.getName();
    let filePath = selectedLogFile && selectedLogFile.get('path');

    return (
      <div className="flex-container-col flex-grow flex-shrink">
        <div className="control-group form-group flex-no-shrink flex-align-right flush-bottom">
          <FilterInputText
            className="flex-grow"
            placeholder="Search"
            searchString={this.state.searchString}
            handleFilterChange={this.handleSearchStringChange}
            inverseStyle={false} />
            {this.getSelectionComponent(selectedLogFile)}
          <a
            className="button button-stroke"
            disabled={!filePath}
            href={TaskDirectoryActions.getDownloadURL(task.slave_id, filePath)}>
            <IconDownload />
          </a>
        </div>
        {this.getLogView(selectedName, filePath, task)}
      </div>
    );
  }
}

TaskDebugView.propTypes = {
  directory: React.PropTypes.object,
  selectedLogFile: React.PropTypes.object,
  showExpandButton: React.PropTypes.func,
  task: React.PropTypes.object
};

TaskDebugView.defaultProps = {
  showExpandButton: function () {},
  task: {}
};

module.exports = TaskDebugView;

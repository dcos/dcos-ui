import classNames from "classnames";
import { Dropdown, Tooltip } from "reactjs-components";
import React from "react";
import { routerShape, formatPattern } from "react-router";

import DirectoryItem from "../../structs/DirectoryItem";
import Icon from "../../../../../../src/js/components/Icon";
import MesosLogContainer from "../../components/MesosLogContainer";
import SearchLog from "../../components/SearchLog";
import TaskDirectory from "../../structs/TaskDirectory";
import TaskDirectoryActions from "../../events/TaskDirectoryActions";
import RouterUtil from "../../../../../../src/js/utils/RouterUtil";

class TaskFileViewer extends React.Component {
  constructor() {
    super(...arguments);

    this.state = { currentFile: null };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { props, state } = this;
    const directory = props.directory;
    const nextDirectory = nextProps.directory;
    const task = state.task;
    const nextTask = nextState.task;

    return (
      // Check task
      props.task !== nextProps.task ||
      (task && nextTask && task.slave_id !== nextTask.slave_id) ||
      // Check current view
      state.currentFile !== nextState.currentFile ||
      // Check directory
      directory !== nextDirectory ||
      (directory &&
        nextDirectory &&
        directory.getItems().length !== nextDirectory.getItems().length)
    );
  }

  handleViewChange(currentFile) {
    const { params, routes } = this.props;
    const path = currentFile.get("path");
    if (path === this.getSelectedFile().get("path")) {
      // File path didn't change, let's not try to update path
      return;
    }

    let routePath = RouterUtil.reconstructPathFromRoutes(routes);
    const hasFilePathParam = routePath.endsWith(":filePath");
    if (!hasFilePathParam && routePath.endsWith("/")) {
      routePath += ":filePath";
    }
    if (!hasFilePathParam && !routePath.endsWith("/")) {
      routePath += "/:filePath";
    }
    this.context.router.push(
      formatPattern(
        routePath,
        Object.assign({}, params, { filePath: encodeURIComponent(path) })
      )
    );
  }

  getLogFiles() {
    const { directory, limitLogFiles } = this.props;
    const logViews = [];
    if (!directory) {
      return logViews;
    }

    const limitLogFilesIsNotEmpty = limitLogFiles.length > 0;

    directory.getItems().forEach(item => {
      const excludeFile =
        limitLogFilesIsNotEmpty && !limitLogFiles.includes(item.getName());

      if (!item.isLogFile() || excludeFile) {
        return;
      }

      logViews.push(item);
    });

    return logViews;
  }

  getLogSelectionAsButtons(logFiles, selectedName) {
    const buttons = logFiles.map((item, index) => {
      const name = item.getName();

      const classes = classNames({
        "button button-stroke": true,
        active: name === selectedName
      });

      return (
        <button
          className={classes}
          key={index}
          onClick={this.handleViewChange.bind(this, item)}
        >
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
    return <span className="flush dropdown-header">{displayName}</span>;
  }

  getDropdownItems(logFiles) {
    return logFiles.map(function(item) {
      const displayName = item.getDisplayName();
      const selectedHtml = this.getItemHtml(displayName);
      const dropdownHtml = <a>{selectedHtml}</a>;

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
    const { props, state } = this;
    const file = state.currentFile;
    const paramsPath = decodeURIComponent(props.params.filePath);
    if (!file && paramsPath !== "undefined") {
      return new DirectoryItem({ path: paramsPath });
    }

    const files = this.getLogFiles();

    return (
      files.find(function(file) {
        return file.getName() === "stdout";
      }) || files[0]
    );
  }

  getSelectionComponent(selectedLogFile) {
    const selectedName = selectedLogFile && selectedLogFile.getName();
    const logFiles = this.getLogFiles();
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
        wrapperClassName="dropdown form-group"
      />
    );
  }

  getActions(selectedLogFile, filePath) {
    const { task } = this.props;

    return [
      this.getSelectionComponent(selectedLogFile),
      <Tooltip key="tooltip" anchor="end" content={"Download log file"}>
        <a
          className="button button-stroke"
          disabled={!filePath}
          href={TaskDirectoryActions.getDownloadURL(task.slave_id, filePath)}
        >
          <Icon id="download" size="mini" />
        </a>
      </Tooltip>
    ];
  }

  render() {
    const { task } = this.props;

    // Only try to get path if file exists
    const selectedLogFile = this.getSelectedFile();
    const selectedName = selectedLogFile && selectedLogFile.getName();
    const filePath = selectedLogFile && selectedLogFile.get("path");

    return (
      <SearchLog actions={this.getActions(selectedLogFile, filePath)}>
        <MesosLogContainer
          filePath={filePath}
          task={task}
          logName={selectedName}
        />
      </SearchLog>
    );
  }
}

TaskFileViewer.contextTypes = {
  router: routerShape
};

TaskFileViewer.defaultProps = {
  limitLogFiles: [],
  task: {}
};

TaskFileViewer.propTypes = {
  directory: React.PropTypes.instanceOf(TaskDirectory),
  limitLogFiles: React.PropTypes.arrayOf(React.PropTypes.string),
  selectedLogFile: React.PropTypes.object,
  task: React.PropTypes.object
};

module.exports = TaskFileViewer;

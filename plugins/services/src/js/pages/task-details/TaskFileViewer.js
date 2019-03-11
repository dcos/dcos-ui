import classNames from "classnames";
import { Dropdown, Tooltip } from "reactjs-components";
import PropTypes from "prop-types";
import React from "react";
import { routerShape, formatPattern } from "react-router";
import { Trans } from "@lingui/macro";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import RouterUtil from "#SRC/js/utils/RouterUtil";

import DirectoryItem from "../../structs/DirectoryItem";
import MesosLogContainer from "../../components/MesosLogContainer";
import SearchLog from "../../components/SearchLog";
import TaskDirectory from "../../structs/TaskDirectory";
import TaskDirectoryActions from "../../events/TaskDirectoryActions";

export default class TaskFileViewer extends React.Component {
  constructor() {
    super(...arguments);

    this.state = { currentFile: null };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const curProps = this.props;
    const curState = this.state;

    const task = curState.task;
    const nextTask = nextState.task;
    const didSlaveIdChange =
      task && nextTask && task.slave_id !== nextTask.slave_id;

    const didTaskChange = curProps.task !== nextProps.task || didSlaveIdChange;

    const directory = curProps.directory;
    const nextDirectory = nextProps.directory;
    const didDirectoryItemsChange =
      directory &&
      nextDirectory &&
      directory.getItems().length !== nextDirectory.getItems().length;

    const didDirectoryChange =
      directory !== nextDirectory || didDirectoryItemsChange;

    const didCurrentFileChange = curState.currentFile !== nextState.currentFile;

    return didTaskChange || didCurrentFileChange || didDirectoryChange;
  }

  handleViewChange(currentFile) {
    const path = currentFile.get("path");
    if (path === this.getSelectedFile().get("path")) {
      // File path didn't change, let's not try to update path
      return;
    }

    const { params, routes } = this.props;
    const routePath = RouterUtil.reconstructPathFromRoutes(routes);

    this.context.router.push(
      formatPattern(
        RouterUtil.getCorrectedFileRoutePath(routePath),
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
        "button button-outline": true,
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
    if (files.length === 0) {
      return null;
    }

    return (
      files.find(function(file) {
        return file.getName() === "stderr";
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
      <Tooltip
        key="tooltip"
        anchor="end"
        content={<Trans render="span">Download log file</Trans>}
      >
        <a
          className="button button-primary-link"
          disabled={!filePath}
          href={TaskDirectoryActions.getDownloadURL(task.slave_id, filePath)}
        >
          <Icon shape={SystemIcons.Download} size={iconSizeXs} />
        </a>
      </Tooltip>
    ];
  }

  getNoLogFiles() {
    return (
      <div className="flex-grow vertical-top">
        <Trans>No log files found on this agent.</Trans>
      </div>
    );
  }

  render() {
    const { task } = this.props;

    // Only try to get path if file exists
    const selectedLogFile = this.getSelectedFile();
    if (!selectedLogFile) {
      return this.getNoLogFiles();
    }
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
  directory: PropTypes.instanceOf(TaskDirectory),
  limitLogFiles: PropTypes.arrayOf(PropTypes.string),
  selectedLogFile: PropTypes.object,
  task: PropTypes.object
};

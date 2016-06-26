import classNames from 'classnames';
import {Dropdown, Tooltip} from 'reactjs-components';
import React from 'react';
import ReactDOM from 'react-dom';

import DirectoryItem from '../../structs/DirectoryItem';
import FilterBar from '../../components/FilterBar';
import FilterInputText from '../../components/FilterInputText';
import Icon from '../../components/Icon';
import KeyboardUtil from '../../utils/KeyboardUtil';
import MesosLogView from '../../components/MesosLogView';
import TaskDirectoryActions from '../../events/TaskDirectoryActions';

const METHODS_TO_BIND = [
  'handleSearchStringChange',
  'handleCountChange',
  'handleKeyDown'
];

class TaskLogsTab extends React.Component {
  constructor() {
    super();

    this.state = {
      currentFile: null,
      watching: 0,
      totalFound: 0
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    let filterInput = ReactDOM.findDOMNode(this.refs.filterInput);

    if (filterInput) {
      filterInput.addEventListener('keydown', this.handleKeyDown);
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    let nextSearchString = nextState.searchString;
    let nextTotalFound = nextState.totalFound;
    let updatedState = {};

    if (nextTotalFound === 0) {
      updatedState.watching = 0;
    } else if (this.state.watching === 0 ||
      nextSearchString != null &&
      this.state.searchString !== nextSearchString) {
      updatedState.watching = 1;
    }

    this.setState(updatedState);
  }

  componentWillUnmount() {
    let filterInput = ReactDOM.findDOMNode(this.refs.filterInput);

    if (filterInput) {
      filterInput.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  handleKeyDown(event) {
    let {keyCode} = event;
    if (keyCode === KeyboardUtil.keyCodes.enter) {
      this.changeWatching('next');
    }
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
        directory.getItems().length !== nextDirectory.getItems().length) ||
      // Check watching
      (state.watching !== nextState.watching)
    );
  }

  handleSearchStringChange(searchString) {
    this.setState({searchString, watching: 1});
  }

  handleViewChange(currentFile) {
    let currentRoutes = this.context.router.getCurrentRoutes();
    let lastRoute = currentRoutes.pop();

    this.context.router.transitionTo(
      lastRoute.name,
      Object.assign(
        {},
        this.props.params,
        {filePath: encodeURIComponent(currentFile.get('path'))}
      )
    );
  }

  handleCountChange(totalFound) {
    this.setState({totalFound});
  }

  changeWatching(direction) {
    let {totalFound, watching} = this.state;
    if (direction === 'next') {
      watching += 1;
      if (watching > totalFound) {
        watching = 1;
      }
    }

    if (direction === 'previous') {
      watching -= 1;
      if (watching < 1) {
        watching = totalFound;
      }
    }

    this.setState({watching});
  }

  getLogView(logName, filePath, task) {
    let {state} = this;

    return (
      <MesosLogView
        filePath={filePath}
        highlightText={state.searchString}
        onCountChange={this.handleCountChange}
        task={task}
        logName={logName}
        watching={state.watching} />
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
        'button button-stroke button-inverse': true,
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
    let file = state.currentFile;
    let paramsPath = decodeURIComponent(props.params.filePath);
    if (!file && paramsPath !== 'undefined') {
      return new DirectoryItem({path: paramsPath});
    } else {
      return this.getLogFiles()[0];
    }
  }

  getSelectionComponent() {
    let selectedLogFile = this.getSelectedFile();
    let selectedName = selectedLogFile && selectedLogFile.getName();
    let logFiles = this.getLogFiles();
    if (logFiles.length < 3) {
      return this.getLogSelectionAsButtons(logFiles, selectedName);
    }

    return (
      <Dropdown
        buttonClassName="button button-inverse dropdown-toggle"
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

  getSearchCount() {
    let {searchString, totalFound, watching} = this.state;

    if (totalFound === 0 && !searchString) {
      return null;
    }

    if (totalFound === 0 && searchString) {
      watching = 0;
    }

    return (
      <span className="search-count mute">
        {`${watching} out of ${totalFound}`}
      </span>
    );
  }

  getSearchButtons() {
    if (this.state.totalFound === 0) {
      return null;
    }

    return (
      <div className="button-group button-group-directions button-inverse">
        <div onClick={this.changeWatching.bind(this, 'previous')}
          className="button button-default button-up-arrow button-stroke button-inverse" />
        <div onClick={this.changeWatching.bind(this, 'next')}
          className="button button-default button-down-arrow button-stroke  button-inverse" />
      </div>
    );
  }

  render() {
    let task = this.props.task;

    // Only try to get path if file exists
    let selectedLogFile = this.getSelectedFile();
    let selectedName = selectedLogFile && selectedLogFile.getName();
    let filePath = selectedLogFile && selectedLogFile.get('path');

    let inputContainerClassSet = classNames({
      'filter-input-text-group-wide': this.state.searchString
    });

    return (
      <div className="flex-container-col flex-grow flex-shrink">
        <FilterBar
          className="filter-bar flex-no-wrap-mini control-group form-group flex-no-shrink flush-bottom"
          leftChildrenClass="filter-bar-left filter-bar-search-container flex-no-wrap flex-grow flex-shrink"
          rightAlignLastNChildren={2}>
          <FilterInputText
            ref="filterInput"
            className="flex-grow flex-box flush-bottom"
            placeholder="Search"
            searchString={this.state.searchString}
            sideText={this.getSearchCount()}
            handleFilterChange={this.handleSearchStringChange}
            inverseStyle={true}
            inputContainerClass={inputContainerClassSet} />
          {this.getSearchButtons()}
          {this.getSelectionComponent(selectedLogFile)}
          <Tooltip anchor="end" content={'Download log file'}>
            <a
              className="button button-stroke button-inverse"
              disabled={!filePath}
              href=
                {TaskDirectoryActions.getDownloadURL(task.slave_id, filePath)}>
              <Icon family="mini" id="download" size="mini" />
            </a>
          </Tooltip>
        </FilterBar>
        {this.getLogView(selectedName, filePath, task)}
      </div>
    );
  }
}

TaskLogsTab.contextTypes = {
  router: React.PropTypes.func
};

TaskLogsTab.propTypes = {
  directory: React.PropTypes.object,
  selectedLogFile: React.PropTypes.object,
  task: React.PropTypes.object
};

TaskLogsTab.defaultProps = {
  task: {}
};

module.exports = TaskLogsTab;

import classNames from 'classnames';
import {Dropdown} from 'reactjs-components';
import deepEqual from 'deep-equal';
import mixin from 'reactjs-mixin';
import React from 'react';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import {APPEND} from '../../../../../../src/js/constants/SystemLogTypes';
import LogView from '../../components/LogView';
import Loader from '../../../../../../src/js/components/Loader';
import MesosStateUtil from '../../../../../../src/js/utils/MesosStateUtil';
import Icon from '../../../../../../src/js/components/Icon';
import RequestErrorMsg from '../../../../../../src/js/components/RequestErrorMsg';
import SearchLog from '../../components/SearchLog';
import SystemLogStore from '../../../../../../src/js/stores/SystemLogStore';
import SystemLogUtil from '../../../../../../src/js/utils/SystemLogUtil';

const METHODS_TO_BIND = [
  'handleAtBottomChange',
  'handleFetchPreviousLog',
  'handleItemSelection'
];

// Number of lines (entries) we asses to be a page
const PAGE_ENTRY_COUNT = 400;

function getLogParameters(task, options) {
  let {framework_id:frameworkID, executor_id:executorID, id} = task;
  if (!executorID) {
    executorID = id;
  }

  return Object.assign({
    containerID: MesosStateUtil.getTaskContainerID(task),
    executorID,
    frameworkID
  }, options);
}

class TaskSystemLogsContainer extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      direction: APPEND,
      fullLog: null,
      hasError: false,
      streams: [],
      isFetchingPrevious: false,
      isLoading: true
    };

    this.store_listeners = [{
      events: ['success', 'error', 'streamSuccess', 'streamError'],
      name: 'systemLog',
      suppressUpdate: true
    }];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * @override
   */
  componentDidMount() {
    super.componentDidMount();
    SystemLogStore.fetchStreamTypes(this.props.task.slave_id);
  }

  /**
   * @override
   */
  componentWillUnmount() {
    super.componentWillUnmount();
    // Unsubscribe and clean up stored log lines
    SystemLogStore.stopTailing(this.state.subscriptionID, true);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {highlightText, task = {}, watching} = this.props;
    const {
      direction,
      fullLog,
      hasError,
      streams,
      isFetchingPrevious,
      isLoading
    } = this.state;

    return Boolean(
      // Check highlightText
      (highlightText !== nextProps.highlightText) ||
      // Check watching
      (watching !== nextProps.watching) ||
      // Check task
      (nextProps.task && task.slave_id !== nextProps.task.slave_id) ||
      // Check direction
      (direction !== nextState.direction) ||
      // Check fullLog
      (fullLog !== nextState.fullLog) ||
      // Check hasError
      (hasError !== nextState.hasError) ||
      // Check streams
      (!deepEqual(streams, nextState.streams)) ||
      // Check isFetchingPrevious
      (isFetchingPrevious !== nextState.isFetchingPrevious) ||
      // Check isLoading
      (isLoading !== nextState.isLoading)
    );
  }

  onSystemLogStoreError(subscriptionID) {
    if (subscriptionID !== this.state.subscriptionID) {
      return;
    }

    this.setState({
      hasError: true,
      isFetchingPrevious: false,
      isLoading: false
    });
  }

  onSystemLogStoreSuccess(subscriptionID, direction) {
    if (subscriptionID !== this.state.subscriptionID) {
      return;
    }

    // Because we don't know if we are at the top when file loads, it will also
    // fire on file load to check whether we are at the top
    if (this.state.isLoading) {
      this.handleFetchPreviousLog();
    }

    this.setState({
      hasError: false,
      direction,
      isFetchingPrevious: false,
      isLoading: false,
      fullLog: SystemLogStore.getFullLog(subscriptionID)
    });
  }

  onSystemLogStoreStreamError() {
    this.setState({hasError: true, isLoading: false});
  }

  onSystemLogStoreStreamSuccess(streams) {
    if (!Array.isArray(streams) || !streams.length) {
      this.setState({hasError: true, isLoading: false});

      return false;
    }

    const {task} = this.props;
    // See if we can find STDOUT, otherwise take the first entry
    const selectedStream = streams.find((item) => item === 'STDOUT')
      || streams[0];
    // Limit 0 means continuous stream
    // Get a full page of previous log entries
    const params = getLogParameters(task, {
      filter: {STREAM: selectedStream},
      limit: 0,
      skip_prev: 1
    });
    const subscriptionID = SystemLogStore.startTailing(task.slave_id, params);

    this.setState({hasError: false, streams, selectedStream, subscriptionID});
  }

  /**
   * Will fetch previous logs, but is also used to check whether we are at the
   * top of the file.
   */
  handleFetchPreviousLog() {
    // Ongoing previous log fetch, wait for that to complete
    if (this.state.isFetchingPrevious) {
      return;
    }

    const {task} = this.props;
    const {subscriptionID} = this.state;

    // Fetch a full page previous log entries to gain more leverage to explore
    // previous logs
    const params = getLogParameters(task, {
      filter: {STREAM: this.state.selectedStream},
      limit: PAGE_ENTRY_COUNT,
      subscriptionID
    });
    SystemLogStore.fetchLogRange(task.slave_id, params);
    this.setState({isFetchingPrevious: true});
  }

  handleAtBottomChange(isAtBottom) {
    const {task} = this.props;
    const {subscriptionID} = this.state;
    if (isAtBottom) {
      // Do not request anymore backwards, but continue stream where we left off
      const params = getLogParameters(task, {
        filter: {STREAM: this.state.selectedStream},
        limit: 0,
        subscriptionID
      });
      SystemLogStore.startTailing(this.props.task.slave_id, params);
    } else {
      SystemLogStore.stopTailing(this.state.subscriptionID);
    }
  }

  handleViewChange(selectedStream) {
    const {task} = this.props;
    // Limit 0 means continuous stream
    // Get a full page of previous log entries
    const params = getLogParameters(task, {
      filter: {STREAM: selectedStream},
      limit: 0,
      skip_prev: 1
    });

    // Unsubscribe and clean up stored log lines
    SystemLogStore.stopTailing(this.state.subscriptionID, true);
    const subscriptionID = SystemLogStore.startTailing(task.slave_id, params);
    this.setState({isLoading: true, selectedStream, subscriptionID});
  }

  getLogSelectionAsButtons() {
    const {streams, selectedStream} = this.state;
    const buttons = streams.map((name, index) => {

      const classes = classNames({
        'button button-stroke': true,
        'active': name === selectedStream
      });

      return (
        <button
          className={classes}
          key={index}
          onClick={this.handleViewChange.bind(this, name)}>
          {name}
        </button>
      );
    });

    return (
      <div key="buttons" className="button-group">
        {buttons}
      </div>
    );
  }

  handleItemSelection(obj) {
    this.handleViewChange.call(this, obj.value);
  }

  getDropdownItems() {
    return this.state.streams.map(function (name) {
      const selectedHtml = <span className="flush dropdown-header">{name}</span>;
      const dropdownHtml = <a>{selectedHtml}</a>;

      return {
        id: name,
        name,
        html: dropdownHtml,
        selectedHtml,
        value: name
      };
    }, this);
  }

  getActions() {
    const {streams, selectedStream} = this.state;
    if (streams.length < 3) {
      return this.getLogSelectionAsButtons();
    }

    return (
      <Dropdown
        key="dropdown"
        buttonClassName="button dropdown-toggle"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        initialID={selectedStream}
        items={this.getDropdownItems()}
        onItemSelection={this.handleItemSelection}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        transition={true}
        transitionName="dropdown-menu"
        wrapperClassName="dropdown form-group" />
    );
  }

  getDownloadButton() {
    const {task} = this.props;
    const {selectedStream} = this.state;
    const params = getLogParameters(task, {
      // This will be added to the name
      postfix: selectedStream && selectedStream.toLowerCase(),
      filter: {STREAM: selectedStream}
    });

    // This is a hacky way of interacting with the API to be able to download
    // logs with a POST request
    return (
      <a
        className="button button-stroke"
        disabled={!task}
        href={SystemLogUtil.getUrl(task.slave_id, params, false, '/download')}
        key="download">
        <Icon id="download" size="mini" />
      </a>
    );
  }

  getLogView() {
    const {
      hasError,
      direction,
      fullLog,
      isLoading,
      selectedStream,
      subscriptionID
    } = this.state;

    if (hasError) {
      return <RequestErrorMsg />;
    }

    if (isLoading) {
      return <Loader />;
    }

    return (
      <LogView
        logName={selectedStream}
        direction={direction}
        fullLog={fullLog}
        fetchPreviousLogs={this.handleFetchPreviousLog}
        onAtBottomChange={this.handleAtBottomChange}
        hasLoadedTop={SystemLogStore.hasLoadedTop(subscriptionID)} />
    );
  }

  render() {
    const actions = [this.getActions(), this.getDownloadButton()];

    return (
      <SearchLog actions={actions}>
        {this.getLogView()}
      </SearchLog>
    );
  }
}

TaskSystemLogsContainer.propTypes = {
  task: React.PropTypes.shape({
    slave_id: React.PropTypes.string
  })
};

module.exports = TaskSystemLogsContainer;

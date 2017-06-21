import mixin from "reactjs-mixin";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

import LogView from "./LogView";
import Loader from "../../../../../src/js/components/Loader";
import MesosLogStore from "../stores/MesosLogStore";
import RequestErrorMsg from "../../../../../src/js/components/RequestErrorMsg";
import TaskDirectoryStore from "../stores/TaskDirectoryStore";
import { APPEND } from "../../../../../src/js/constants/SystemLogTypes";

const METHODS_TO_BIND = [
  "handleGoToWorkingDirectory",
  "handleFetchPreviousLog",
  "onMesosLogStoreError",
  "onMesosLogStoreSuccess"
];

class MesosLogContainer extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      direction: APPEND,
      fullLog: null,
      isFetchingPrevious: false,
      isLoading: true,
      hasLoadingError: 0
    };

    this.store_listeners = [
      {
        events: ["success", "error"],
        name: "mesosLog",
        suppressUpdate: true
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    const { filePath, task } = this.props;
    if (!filePath) {
      return;
    }

    MesosLogStore.startTailing(task.slave_id, filePath);
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);
    const { props } = this;
    if (props.filePath === nextProps.filePath) {
      return;
    }

    // Change to filePath has happened
    this.setState({
      direction: APPEND,
      fullLog: null,
      isFetchingPrevious: false,
      isLoading: true,
      hasLoadingError: 0
    });
    if (props.filePath) {
      // Clean up data as well
      MesosLogStore.stopTailing(props.filePath, true);
    }
    if (nextProps.filePath) {
      MesosLogStore.startTailing(nextProps.task.slave_id, nextProps.filePath);
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount(...arguments);
    MesosLogStore.stopTailing(this.props.filePath, true);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      filePath,
      highlightText,
      logName,
      onCountChange,
      task,
      watching
    } = this.props;
    const {
      direction,
      fullLog,
      hasLoadingError,
      isFetchingPrevious,
      isLoading
    } = this.state;

    return (
      // Check filePath
      filePath !== nextProps.filePath ||
      // Check logName
      logName !== nextProps.logName ||
      // Check highlightText
      highlightText !== nextProps.highlightText ||
      // Check watching
      watching !== nextProps.watching ||
      // Check watching
      onCountChange !== nextProps.onCountChange ||
      // Check task (slave_id is the only property being used)
      task.slave_id !== nextProps.task.slave_id ||
      // Check direction
      direction !== nextState.direction ||
      // Check hasLoadingError
      hasLoadingError !== nextState.hasLoadingError ||
      // Check isFetchingPrevious
      isFetchingPrevious !== nextState.isFetchingPrevious ||
      // Check isLoading
      isLoading !== nextState.isLoading ||
      // Check fullLog at the end, as this could be a long string
      fullLog !== nextState.fullLog
    );
  }

  onMesosLogStoreError(path) {
    // Check the filePath before we reload
    if (path !== this.props.filePath) {
      // This event is not for our filePath
      return;
    }

    this.setState({
      hasLoadingError: this.state.hasLoadingError + 1,
      isFetchingPrevious: false
    });
  }

  onMesosLogStoreSuccess(path, direction) {
    // Check the filePath before we reload
    const { filePath } = this.props;
    if (path !== filePath) {
      // This event is not for our filePath
      return;
    }

    const logBuffer = MesosLogStore.getLogBuffer(filePath);
    const fullLog = logBuffer.getFullLog();

    this.setState({
      direction,
      hasLoadingError: 0,
      isFetchingPrevious: false,
      isLoading: !filePath,
      fullLog
    });
  }

  handleGoToWorkingDirectory() {
    TaskDirectoryStore.setPath(this.props.task, "");
  }

  handleFetchPreviousLog(props = this.props) {
    const { isFetchingPrevious } = this.state;
    const { task, filePath } = props;
    // Ongoing previous log fetch, wait for that to complete
    if (isFetchingPrevious) {
      return;
    }

    MesosLogStore.getPreviousLogs(task.slave_id, filePath);
    this.setState({ isFetchingPrevious: true });
  }

  getErrorScreen() {
    return <RequestErrorMsg />;
  }

  getLog() {
    const {
      filePath,
      highlightText,
      logName,
      onCountChange,
      watching
    } = this.props;
    const { direction, fullLog } = this.state;

    if (!logName) {
      return this.getEmptyDirectoryScreen();
    }

    return (
      <LogView
        direction={direction}
        fetchPreviousLogs={this.handleFetchPreviousLog}
        fullLog={fullLog}
        hasLoadedTop={MesosLogStore.hasLoadedTop(filePath)}
        highlightText={highlightText}
        logName={logName}
        onCountChange={onCountChange}
        watching={watching}
      />
    );
  }

  getLoadingScreen() {
    return <Loader />;
  }

  getEmptyDirectoryScreen() {
    return (
      <div className="flex-grow vertical-center">
        <h3 className="text-align-center flush-top">
          This directory does not contain any logs.
        </h3>
      </div>
    );
  }

  render() {
    const { hasLoadingError, isLoading } = this.state;

    if (hasLoadingError >= 3) {
      return this.getErrorScreen();
    }

    if (isLoading) {
      return this.getLoadingScreen();
    }

    return (
      <div className="log-view flex flex-direction-top-to-bottom flex-item-grow-1 flex-item-shrink-1">
        {this.getLog()}
      </div>
    );
  }
}

MesosLogContainer.defaultProps = {
  highlightText: ""
};

MesosLogContainer.propTypes = {
  filePath: React.PropTypes.string,
  highlightText: React.PropTypes.string,
  logName: React.PropTypes.string,
  task: React.PropTypes.object.isRequired,
  watching: React.PropTypes.number
};

module.exports = MesosLogContainer;

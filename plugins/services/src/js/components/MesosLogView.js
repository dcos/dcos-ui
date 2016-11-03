import mixin from 'reactjs-mixin';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ReactDOM from 'react-dom';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import DOMUtils from '../../../../../src/js/utils/DOMUtils';
import Highlight from './Highlight';
import Loader from '../../../../../src/js/components/Loader';
import MesosLogStore from '../stores/MesosLogStore';
import RequestErrorMsg from '../../../../../src/js/components/RequestErrorMsg';
import TaskDirectoryStore from '../stores/TaskDirectoryStore';
import Util from '../../../../../src/js/utils/Util';

const METHODS_TO_BIND = [
  'handleGoToBottom',
  'handleGoToWorkingDirectory',
  'handleLogContainerScroll',
  'onMesosLogStoreError',
  'onMesosLogStoreSuccess'
];

class MesosLogView extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      fullLog: null,
      hasLoadingError: 0,
      isAtBottom: true
    };

    this.store_listeners = [{
      events: ['success', 'error'],
      name: 'mesosLog',
      suppressUpdate: true
    }];

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.handleLogContainerScroll = Util.throttleScroll(
      this.handleLogContainerScroll, 500
    );

    this.handleWindowResize = Util.debounce(
      this.handleWindowResize.bind(this), 100
    );
  }

  componentDidMount() {
    super.componentDidMount(...arguments);
    let {props} = this;
    if (props.filePath) {
      MesosLogStore.startTailing(props.task.slave_id, props.filePath);
    }
    global.addEventListener('resize', this.handleWindowResize);
  }

  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(...arguments);
    let {props} = this;
    if (props.filePath === nextProps.filePath) {
      return;
    }

    // Change to filePath has happened
    this.setState({fullLog: null});
    if (props.filePath) {
      MesosLogStore.stopTailing(props.filePath);
    }
    if (nextProps.filePath) {
      MesosLogStore.startTailing(nextProps.task.slave_id, nextProps.filePath);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    super.componentDidUpdate(...arguments);

    let logContainerNode = this.getLogContainerNode();
    if (logContainerNode == null) {
      return;
    }

    if (!prevState.fullLog && this.state.fullLog) {
      logContainerNode.scrollTop = logContainerNode.scrollHeight;
      return;
    }

    if (prevProps.watching !== this.props.watching ||
      prevProps.highlightText !== this.props.highlightText) {
      this.goToNewHighlightedSearch();
    }

    this.checkIfAwayFromBottom(logContainerNode);
  }

  componentWillUnmount() {
    super.componentWillUnmount(...arguments);
    MesosLogStore.stopTailing(this.props.filePath);
    global.removeEventListener('resize', this.handleWindowResize);
  }

  shouldComponentUpdate(nextProps, nextState) {
    let {props, state} = this;

    return !!(
      // Check highlightText
      (props.highlightText !== nextProps.highlightText) ||
      // Check filePath
      (props.filePath !== nextProps.filePath) ||
      // Check logName
      (props.logName !== nextProps.logName) ||
      // Check task (slave_id is the only property being used)
      (props.task.slave_id !== nextProps.task.slave_id) ||
      // Check hasLoadingError
      (state.hasLoadingError !== nextState.hasLoadingError) ||
      // Check fullLog
      (state.fullLog !== nextState.fullLog) ||
      // Check isAtBottom
      (state.isAtBottom !== nextState.isAtBottom) ||
      // Check watching
      (props.watching !== nextProps.watching)
    );
  }

  handleLogContainerScroll(e) {
    let container = e.target;
    if (!container) {
      return;
    }

    this.checkIfCloseToTop(container);
    this.checkIfAwayFromBottom(container);
  }

  handleGoToBottom() {
    let logContainerNode = this.getLogContainerNode();
    if (logContainerNode == null) {
      return;
    }

    DOMUtils.scrollTo(
      logContainerNode,
      3000,
      logContainerNode.scrollHeight - logContainerNode.clientHeight
    );
  }

  handleGoToWorkingDirectory() {
    TaskDirectoryStore.setPath(this.props.task, '');
  }

  handleWindowResize() {
    this.checkIfAwayFromBottom(this.refs.logContainer);
  }

  onMesosLogStoreError(path) {
    // Check the filePath before we reload
    if (path !== this.props.filePath) {
      // This event is not for our filePath
      return;
    }

    this.setState({hasLoadingError: this.state.hasLoadingError + 1});
  }

  onMesosLogStoreSuccess(path, direction) {
    // Check the filePath before we reload
    let {filePath} = this.props;
    if (path !== filePath) {
      // This event is not for our filePath
      return;
    }

    let logContainer = ReactDOM.findDOMNode(this.refs.logContainer);
    let previousScrollTop;
    let previousScrollHeight;

    if (logContainer) {
      previousScrollTop = logContainer.scrollTop;
      previousScrollHeight = logContainer.scrollHeight;
    }

    let fullLog = MesosLogStore.get(filePath).getFullLog();
    this.setState({fullLog}, () => {
      // This allows the user to stay at the place of the log they were at
      // before the prepend.
      if (direction === 'prepend' && previousScrollHeight) {
        let currentScrollHeight = logContainer.scrollHeight;
        let heightDifference = currentScrollHeight - previousScrollHeight;
        this.setScrollTop(previousScrollTop + heightDifference);
      }
    });
  }

  setScrollTop(scrollTop) {
    ReactDOM.findDOMNode(this.refs.logContainer).scrollTop = scrollTop;
  }

  checkIfCloseToTop(container) {
    let distanceFromTop = DOMUtils.getDistanceFromTop(container);
    let logBuffer = MesosLogStore.get(this.props.filePath);
    if (distanceFromTop < 2000 && !(logBuffer && logBuffer.hasLoadedTop())) {
      let {props} = this;
      MesosLogStore.getPreviousLogs(props.task.slave_id, props.filePath);
    }
  }

  checkIfAwayFromBottom(container) {
    let distanceFromTop = DOMUtils.getDistanceFromTop(container);
    let isAtBottom = container.offsetHeight + distanceFromTop
      >= container.scrollHeight;

    if (isAtBottom !== this.state.isAtBottom) {
      this.setState({isAtBottom});
    }
  }

  goToNewHighlightedSearch() {
    let logContainer = this.getLogContainerNode();
    let node = logContainer.querySelector('.highlight.selected');
    if (!node) {
      return;
    }

    let containerHeight = logContainer.clientHeight;
    let containerScrollTop = logContainer.scrollTop;
    let nodeDistanceFromTop = DOMUtils.getDistanceFromTopOfParent(node);

    if ((nodeDistanceFromTop > containerHeight + containerScrollTop) ||
      nodeDistanceFromTop < containerScrollTop) {
      logContainer.scrollTop = nodeDistanceFromTop - (containerHeight / 2);
    }
  }

  getLogContainerNode() {
    let logContainer = this.refs.logContainer;
    if (!logContainer) {
      return null;
    }

    return ReactDOM.findDOMNode(logContainer);
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

  getEmptyLogScreen() {
    let {logName} = this.props;
    // Append space if logName is defined
    logName = logName && (logName + ' ');

    return (
      <div className="flex-grow vertical-center">
        <h3 className="text-align-center flush-top">
          {`${logName} Log is Currently Empty`}
        </h3>
        <p className="text-align-center flush-bottom">
          Please try again later.
        </p>
      </div>
    );
  }

  getErrorScreen() {
    return <RequestErrorMsg />;
  }

  getLog() {
    let {props, state} = this;

    if (!props.logName) {
      return this.getEmptyDirectoryScreen();
    }
    let fullLog = state.fullLog;
    if (fullLog === '') {
      return this.getEmptyLogScreen();
    }

    return (
      <pre
        className="flex-item-grow-1 flush-bottom prettyprint"
        ref="logContainer"
        onScroll={this.handleLogContainerScroll}>
        {this.getLogPrepend()}
        <Highlight
          matchClass="highlight"
          matchElement="span"
          onCountChange={props.onCountChange}
          search={props.highlightText}
          watching={props.watching}>
          {fullLog}
        </Highlight>
      </pre>
    );
  }

  getLoadingScreen() {
    return <Loader />;
  }

  getGoToBottomButton() {
    let isAtBottom = this.state.isAtBottom;

    if (isAtBottom) {
      return null;
    }

    return (
      <button
        onClick={this.handleGoToBottom}
        className="button button-inverse go-to-bottom-button">
        Go to bottom
      </button>
    );
  }

  getLogPrepend() {
    let logBuffer = MesosLogStore.get(this.props.filePath);
    if (!logBuffer || logBuffer.hasLoadedTop()) {
      return (
        <div className="text-align-center">
          (AT BEGINNING OF FILE)
        </div>
      );
    }

    // Show loader since we will start a request for more logs
    return (
      <Loader
        className="pod pod-tall-bottom flush-right flush-left"
        size="small"
        type="ballSpinFadeLoader" />
    );
  }

  render() {
    let {props, state} = this;

    if (state.hasLoadingError >= 3) {
      return this.getErrorScreen();
    }

    if (props.filePath && props.logName && state.fullLog == null) {
      return this.getLoadingScreen();
    }

    return (
      <div className="log-view flex flex-item-grow-1 flex-item-shrink-1">
        {this.getLog()}
        <ReactCSSTransitionGroup
          transitionAppear={true}
          transitionName="button"
          transitionAppearTimeout={350}
          transitionEnterTimeout={350}
          transitionLeaveTimeout={350}
          component="div">
          {this.getGoToBottomButton()}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

MesosLogView.defaultProps = {
  highlightText: ''
};

MesosLogView.propTypes = {
  filePath: React.PropTypes.string,
  highlightText: React.PropTypes.string,
  logName: React.PropTypes.string,
  task: React.PropTypes.object.isRequired,
  watching: React.PropTypes.number
};

module.exports = MesosLogView;

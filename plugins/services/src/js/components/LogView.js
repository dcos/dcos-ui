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
  'handleLogContainerScroll',
  'handleWindowResize'
];

class LogView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      isAtBottom: true,
      userScroll: true
    };

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
    global.addEventListener('resize', this.handleWindowResize);
  }

  componentWillReceiveProps(nextProps) {
    let {logContainer} = this;
    let previousScrollTop;
    let previousScrollHeight;

    if (logContainer) {
      previousScrollTop = logContainer.scrollTop;
      previousScrollHeight = logContainer.scrollHeight;
    }

    // This allows the user to stay at the place of the log they were at
    // before the prepend.
    if (nextProps.direction === 'prepend' && previousScrollHeight) {
      let currentScrollHeight = logContainer.scrollHeight;
      let heightDifference = currentScrollHeight - previousScrollHeight;
      this.setScrollTop(previousScrollTop + heightDifference);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    let {highlightText, logName, fullLog, watching} = this.props;
    let {isAtBottom} = this.state;

    return !!(
      // Check highlightText
      (highlightText !== nextProps.highlightText) ||
      // Check logName
      (logName !== nextProps.logName) ||
      // Check fullLog
      (fullLog !== nextProps.fullLog) ||
      // Check watching
      (watching !== nextProps.watching) ||
      // Check isAtBottom
      (isAtBottom !== nextState.isAtBottom)
    );
  }

  componentDidUpdate(prevProps) {
    let {logContainer, logNode} = this;
    if (logContainer == null) {
      return;
    }

    if (!prevProps.fullLog && this.props.fullLog) {
      logContainer.scrollTop = logContainer.scrollHeight;
      return;
    }

    if (prevProps.watching !== this.props.watching ||
      prevProps.highlightText !== this.props.highlightText) {
      this.goToNewHighlightedSearch();
    }

    if (DOMUtils.getComputedHeight(logContainer) < DOMUtils.getComputedHeight(logNode) && this.state.isAtBottom) {
      this.handleGoToBottom();
    }
  }

  componentWillUnmount() {
    global.removeEventListener('resize', this.handleWindowResize);
  }

  handleLogContainerScroll(event) {
    let {target} = event;
    if (!target) {
      return;
    }

    if (this.state.userScroll) {
      this.checkIfCloseToTop(target);
      this.checkIfAwayFromBottom(target);
    }
  }

  handleGoToBottom() {
    let {logContainer} = this;
    if (logContainer == null || !this.state.userScroll) {
      return;
    }

    this.setState({userScroll: false}, () => {
      DOMUtils.scrollTo(
        logContainer,
        3000,
        logContainer.scrollHeight - logContainer.clientHeight,
        () => {
          this.setState({userScroll: true});
        }
      );
    });
  }

  handleWindowResize() {
    this.checkIfAwayFromBottom(this.logContainer);
  }

  setScrollTop(scrollTop) {
    this.logContainer.scrollTop = scrollTop;
  }

  checkIfCloseToTop(container) {
    let {hasLoadedTop, fetchPreviousLogs} = this.props;
    let distanceFromTop = DOMUtils.getDistanceFromTop(container);
    if (distanceFromTop < 100 && !this.state.closeToTop) {
      this.setState({closeToTop: true}, () => {
        if (!hasLoadedTop()) {
          fetchPreviousLogs();
        }
      });
    }

    if (distanceFromTop > 100 && this.state.closeToTop) {
      this.setState({closeToTop: false});
    }
  }

  checkIfAwayFromBottom(container) {
    let distanceFromTop = DOMUtils.getDistanceFromTop(container);
    let isAtBottom = container.offsetHeight + distanceFromTop
      >= container.scrollHeight;

    if (isAtBottom !== this.state.isAtBottom) {
      this.setState({isAtBottom});
      this.props.onAtBottomChange(isAtBottom);
    }

  }

  goToNewHighlightedSearch() {
    let {logContainer} = this;
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

  getLog() {
    let {fullLog, highlightText, onCountChange, watching} = this.props;

    if (fullLog === '') {
      return this.getEmptyLogScreen();
    }

    return (
      <pre
        className="flex-item-grow-1 flush-bottom prettyprint"
        ref={(ref) => { this.logContainer = ref; }}
        onScroll={this.handleLogContainerScroll}
        style={{wordWrap: 'break-word', whiteSpace: 'pre-wrap'}}>
        {this.getLogPrepend()}
        <Highlight
          matchClass="highlight"
          matchElement="span"
          onCountChange={onCountChange}
          search={highlightText}
          watching={watching}>
          <span ref={(ref) => { this.logNode = ref; }}>
            {fullLog}
          </span>
        </Highlight>
      </pre>
    );
  }

  getGoToBottomButton() {
    let {isAtBottom} = this.state;

    if (isAtBottom) {
      return null;
    }

    return (
      <button
        onClick={this.handleGoToBottom}
        className="button go-to-bottom-button">
        Go to bottom
      </button>
    );
  }

  getLogPrepend() {
    if (this.props.hasLoadedTop()) {
      return (
        <div className="text-align-center vertical-center">
          (AT BEGINNING OF FILE)
        </div>
      );
    }

    // Show loader since we will start a request for more logs
    return (
      <div className="pod flush-top">
        <Loader
          innerClassName="loader-small"
          type="ballSpinFadeLoader" />
      </div>
    );
  }

  render() {
    return (
      <div className="log-view pod inverse flex flex-direction-top-to-bottom flex-item-grow-1 flex-item-shrink-1">
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

LogView.defaultProps = {
  hasLoadedTop: function () { return false; },
  highlightText: '',
  fetchPreviousLogs: function () {},
  onAtBottomChange: function () {},
  onCountChange: function () {}
};

LogView.propTypes = {
  hasLoadedTop: React.PropTypes.func,
  highlightText: React.PropTypes.string,
  fetchPreviousLogs: React.PropTypes.func,
  onAtBottomChange: React.PropTypes.func,
  onCountChange: React.PropTypes.func,
  logName: React.PropTypes.string,
  watching: React.PropTypes.number
};

module.exports = LogView;

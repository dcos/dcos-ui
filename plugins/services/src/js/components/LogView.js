import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import DOMUtils from '../../../../../src/js/utils/DOMUtils';
import Highlight from './Highlight';
import Loader from '../../../../../src/js/components/Loader';
import Util from '../../../../../src/js/utils/Util';
import {PREPEND} from '../../../../../src/js/constants/SystemLogTypes';

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
      userScroll: true,
      fullLog: this.props.fullLog
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

    // Since we can receive a lot of updates (from a stream potentially),
    // let's debounce this function to not call it too often
    this.componentDidUpdate = Util.debounce(
      this.componentDidUpdate.bind(this), 100
    );
  }

  componentDidMount() {
    global.addEventListener('resize', this.handleWindowResize);
  }

  componentWillReceiveProps(nextProps) {
    const {logContainer} = this;
    let previousScrollTop;
    let previousScrollHeight;

    if (logContainer) {
      previousScrollTop = logContainer.scrollTop;
      previousScrollHeight = logContainer.scrollHeight;
    }

    // Prevent updates to fullLog, if it has not changed
    if (this.state.fullLog !== nextProps.fullLog) {
      this.setState({fullLog: nextProps.fullLog}, function () {
        // This allows the user to stay at the place of the log they were at
        // before the prepend.
        if (nextProps.direction === PREPEND && previousScrollHeight
          && logContainer) {
          const currentScrollHeight = logContainer.scrollHeight;
          const heightDifference = currentScrollHeight - previousScrollHeight;
          logContainer.scrollTop = previousScrollTop + heightDifference;
        }
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {hasLoadedTop, highlightText, logName, watching} = this.props;
    const {fullLog, isAtBottom} = this.state;

    return !!(
      // Check hasLoadedTop
      (hasLoadedTop !== nextProps.hasLoadedTop) ||
      // Check highlightText
      (highlightText !== nextProps.highlightText) ||
      // Check logName
      (logName !== nextProps.logName) ||
      // Check fullLog
      (fullLog !== nextState.fullLog) ||
      // Check watching
      (watching !== nextProps.watching) ||
      // Check isAtBottom
      (isAtBottom !== nextState.isAtBottom)
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const {logContainer, logNode} = this;
    if (logContainer == null) {
      return;
    }

    if (!prevState.fullLog && this.state.fullLog) {
      logContainer.scrollTop = logContainer.scrollHeight;
      return;
    }

    if (prevProps.watching !== this.props.watching ||
      prevProps.highlightText !== this.props.highlightText) {
      this.goToNewHighlightedSearch();
    }

    // Make sure to scroll to bottom if there is a view to scroll,
    // i.e. more logs than log view height
    if (DOMUtils.getComputedHeight(logContainer) <
      DOMUtils.getComputedHeight(logNode) && this.state.isAtBottom) {
      this.handleGoToBottom();
    }

    // If the amount of logs is less than the size of the container, let's
    // request backwards to see if we have reached the top
    if (DOMUtils.getComputedHeight(logContainer) >=
      DOMUtils.getComputedHeight(logNode)) {
      this.checkIfCloseToTop(logContainer);
    }
  }

  componentWillUnmount() {
    global.removeEventListener('resize', this.handleWindowResize);
  }

  handleLogContainerScroll(event) {
    const {target} = event;
    if (!target) {
      return;
    }

    this.checkIfCloseToTop(target);
    // Only update variables if user actually interacts with the view
    if (this.state.userScroll) {
      this.checkIfAwayFromBottom(target);
    }
  }

  handleGoToBottom() {
    const {logContainer, props: {highlightText}, state: {userScroll}} = this;
    // Do not scroll to bottom if we want to highlight a word in the log,
    // or we are already scrolling
    if (logContainer == null || highlightText || !userScroll) {
      return;
    }

    // Cap animation time between 500 and 3000
    const animationTime = Math.max(
      Math.min(
        logContainer.scrollHeight - DOMUtils.getDistanceFromTop(logContainer),
        3000
      ),
      500
    );

    // Let's not handle user scroll events when animating
    this.setState({userScroll: false}, () => {
      DOMUtils.scrollTo(
        logContainer,
        animationTime,
        logContainer.scrollHeight - logContainer.clientHeight,
        () => {
          this.setState({userScroll: true});
        }
      );
    });
  }

  handleWindowResize() {
    this.checkIfCloseToTop(this.logContainer);
    this.checkIfAwayFromBottom(this.logContainer);
  }

  checkIfCloseToTop(container) {
    const {closeToTop} = this.state;
    const distanceFromTop = DOMUtils.getDistanceFromTop(container);
    if (distanceFromTop < 100 && !closeToTop) {
      this.setState({closeToTop: true}, () => {
        const {hasLoadedTop, fetchPreviousLogs} = this.props;
        if (!hasLoadedTop) {
          fetchPreviousLogs();
        }
      });
    }

    if (distanceFromTop > 100 && closeToTop) {
      this.setState({closeToTop: false});
    }
  }

  checkIfAwayFromBottom(container) {
    const distanceFromTop = DOMUtils.getDistanceFromTop(container);
    const isAtBottom = container.offsetHeight + distanceFromTop
      >= container.scrollHeight;

    if (isAtBottom !== this.state.isAtBottom) {
      this.setState({isAtBottom});
      this.props.onAtBottomChange(isAtBottom);
    }

  }

  goToNewHighlightedSearch() {
    const {logContainer} = this;
    const node = logContainer.querySelector('.highlight.selected');
    if (!node) {
      return;
    }

    const containerHeight = logContainer.clientHeight;
    const containerScrollTop = logContainer.scrollTop;
    const nodeDistanceFromTop = DOMUtils.getDistanceFromTopOfParent(node);

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
      <div className="flex-grow horizontal-center vertical-center">
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
    let {highlightText, onCountChange, watching} = this.props;
    let {fullLog} = this.state;

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
        <div ref={(ref) => { this.logNode = ref; }}>
          <Highlight
            matchClass="highlight"
            matchElement="span"
            onCountChange={onCountChange}
            search={highlightText}
            watching={watching}>
            {fullLog}
          </Highlight>
        </div>
      </pre>
    );
  }

  getGoToBottomButton() {
    const {highlightText} = this.props;
    const {isAtBottom} = this.state;

    // Do not show go to bottom button, if we are already at the bottom,
    // or we are have highlighted text
    if (isAtBottom || highlightText) {
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
    if (this.props.hasLoadedTop) {
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
      <div className="log-view flex flex-direction-top-to-bottom flex-item-grow-1 flex-item-shrink-1">
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
  hasLoadedTop: false,
  highlightText: '',
  fetchPreviousLogs() {},
  onAtBottomChange() {},
  onCountChange() {}
};

LogView.propTypes = {
  hasLoadedTop: React.PropTypes.bool,
  highlightText: React.PropTypes.string,
  fetchPreviousLogs: React.PropTypes.func,
  onAtBottomChange: React.PropTypes.func,
  onCountChange: React.PropTypes.func,
  logName: React.PropTypes.string,
  watching: React.PropTypes.number
};

module.exports = LogView;

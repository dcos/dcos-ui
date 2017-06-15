import React from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import throttle from "lodash.throttle";

import { PREPEND } from "../../../../../src/js/constants/SystemLogTypes";
import DOMUtils from "../../../../../src/js/utils/DOMUtils";
import EmptyLogScreen from "./EmptyLogScreen";
import Highlight from "./Highlight";
import Loader from "../../../../../src/js/components/Loader";

const CONTAINER_OFFSET_HEIGHT = 25;

const METHODS_TO_BIND = [
  "handleGoToBottom",
  "handleLogContainerScroll",
  "handleUpdateScrollPosition",
  "handleWindowResize"
];

class LogView extends React.Component {
  constructor() {
    super(...arguments);

    // Using variable on component to avoid the asynchronous `setState`
    this.updatingScrollPosition = false;

    this.state = { isAtBottom: true };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });

    // Make sure to run this on the leading edge to capture this event as soon
    // as possible. This has impact on both checkIfCloseToTop and
    // checkIfAwayFromBottom. Trailing edge will call them too late, i.e. when
    // the data is out of data and possibly scrolled passed the trigger range.
    // We also want it at the trailing end because if a user scrolls too fast
    // there's a chance that the callback will get fired but not where the
    // scrolling position has ended.
    // We need them to be called as soon as we hit the range wherein these will
    // trigger handlers.
    this.handleLogContainerScroll = throttle(
      this.handleLogContainerScroll,
      50,
      { leading: true, trailing: true }
    );

    this.handleWindowResize = throttle(this.handleWindowResize, 50, {
      leading: true,
      trailing: false
    });
  }

  componentDidMount() {
    global.addEventListener("resize", this.handleWindowResize);
    // Make sure to update scroll position on load. Needs to be did mount for
    // logContainer to be defined
    this.handleUpdateScrollPosition();
  }

  componentWillReceiveProps(nextProps) {
    this.handleUpdateScrollPosition(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { hasLoadedTop, highlightText, logName, watching } = this.props;
    const { fullLog, isAtBottom } = this.state;

    return (
      // Check hasLoadedTop
      hasLoadedTop !== nextProps.hasLoadedTop ||
      // Check highlightText
      highlightText !== nextProps.highlightText ||
      // Check logName
      logName !== nextProps.logName ||
      // Check watching
      watching !== nextProps.watching ||
      // Check isAtBottom
      isAtBottom !== nextState.isAtBottom ||
      // Check fullLog at the end, as this could be a long string
      fullLog !== nextState.fullLog
    );
  }

  componentDidUpdate(prevProps) {
    const { logContainer } = this;
    if (logContainer == null) {
      return;
    }

    // Make sure to go to bottom if we are tailing
    if (this.state.isAtBottom) {
      // Set `updatingScrollPosition` guard to avoid 'at top' and
      // 'at bottom' checks when computationally setting the `scrollTop`
      this.updatingScrollPosition = true;
      // Warning: Causes reflow!
      logContainer.scrollTop = logContainer.scrollHeight;
      this.updatingScrollPosition = false;

      return;
    }

    if (
      prevProps.watching !== this.props.watching ||
      prevProps.highlightText !== this.props.highlightText
    ) {
      this.goToNewHighlightedSearch();
    }
  }

  componentWillUnmount() {
    global.removeEventListener("resize", this.handleWindowResize);
  }

  handleUpdateScrollPosition(props = this.props) {
    const { direction, fullLog } = props;
    // Prevent updates to fullLog, if it has not changed
    if (this.state.fullLog !== fullLog) {
      const { logContainer } = this;
      let previousScrollTop;
      let previousScrollHeight;
      if (logContainer && direction === PREPEND && !this.state.isAtBottom) {
        // Warning: Causes reflow!
        previousScrollTop = logContainer.scrollTop;
        previousScrollHeight = logContainer.scrollHeight;
      }
      this.setState({ fullLog }, () => {
        // This allows the user to stay at the place of the log they were at
        // before the prepend.
        if (previousScrollHeight) {
          const currentScrollHeight = logContainer.scrollHeight;
          const heightDifference = currentScrollHeight - previousScrollHeight;
          // Set `updatingScrollPosition` guard to avoid 'at top' and
          // 'at bottom' checks when computationally setting the `scrollTop`
          this.updatingScrollPosition = true;
          // Warning: Causes reflow!
          logContainer.scrollTop = previousScrollTop + heightDifference;
          this.updatingScrollPosition = false;
        }
      });
    }
  }

  handleLogContainerScroll() {
    this.checkIfCloseToTop(this.logContainer);
    this.checkIfAwayFromBottom(this.logContainer);
  }

  handleGoToBottom() {
    const { logContainer, props: { highlightText } } = this;
    // Do not scroll to bottom if we want to highlight a word in the log,
    // or we are already scrolling
    if (logContainer == null || highlightText) {
      return;
    }

    // Cap animation time between 500 and 3000
    const scrollDistance = logContainer.scrollHeight - logContainer.scrollTop;
    const animationTime = Math.max(500, Math.min(scrollDistance, 3000));

    // Do not set `updatingScrollPosition` during animation as the user could
    // decide to scroll away while we are animating
    DOMUtils.scrollTo(
      logContainer,
      animationTime,
      logContainer.scrollHeight - logContainer.clientHeight
    );
  }

  handleWindowResize() {
    this.checkIfCloseToTop(this.logContainer);
    this.checkIfAwayFromBottom(this.logContainer);
  }

  checkIfCloseToTop(container) {
    // Cancel check if we are changing the scroll position computationally
    if (!container || this.updatingScrollPosition) {
      return;
    }

    // This number has been determined by trail and error to be a good
    // measurement for close to the top
    if (container.scrollTop < 2000) {
      const { hasLoadedTop, fetchPreviousLogs } = this.props;
      if (!hasLoadedTop) {
        fetchPreviousLogs();
      }
    }
  }

  checkIfAwayFromBottom(container) {
    // Cancel check if we are changing the scroll position computationally
    if (!container || this.updatingScrollPosition) {
      return;
    }

    // The CONTAINER_OFFSET_HEIGHT is to give the checker a little bit of
    // breathing room to determine when we are at the bottom
    const isAtBottom =
      container.offsetHeight + container.scrollTop + CONTAINER_OFFSET_HEIGHT >=
      container.scrollHeight;

    if (isAtBottom !== this.state.isAtBottom) {
      this.setState({ isAtBottom });
    }
  }

  goToNewHighlightedSearch() {
    const { logContainer } = this;
    const node = logContainer.querySelector(".highlight.selected");
    if (!node || !logContainer) {
      return;
    }

    // Warning: Causes reflow!
    const containerHeight = logContainer.clientHeight;
    const containerScrollTop = logContainer.scrollTop;
    const nodeDistanceFromTop = DOMUtils.getDistanceFromTopOfParent(node);

    if (
      nodeDistanceFromTop > containerHeight + containerScrollTop ||
      nodeDistanceFromTop < containerScrollTop
    ) {
      // Set `updatingScrollPosition` guard to avoid 'at top' and
      // 'at bottom' checks when computationally setting the `scrollTop`
      this.updatingScrollPosition = true;
      // Warning: Causes reflow!
      logContainer.scrollTop = nodeDistanceFromTop - containerHeight / 2;
      this.updatingScrollPosition = false;
    }
  }

  getLog() {
    const { highlightText, logName, onCountChange, watching } = this.props;
    const { fullLog } = this.state;

    if (fullLog === "") {
      return <EmptyLogScreen logName={logName} />;
    }

    return [
      <pre
        key="log-container"
        className="flex-item-grow-1 flush-bottom prettyprint"
        ref={ref => {
          this.logContainer = ref;
        }}
        onScroll={this.handleLogContainerScroll}
      >
        {this.getLogPrepend()}
        <Highlight
          matchClass="highlight"
          matchElement="span"
          onCountChange={onCountChange}
          search={highlightText}
          watching={watching}
        >
          {fullLog}
        </Highlight>
      </pre>,
      <ReactCSSTransitionGroup
        key="log-go-down-button"
        transitionAppear={true}
        transitionName="button"
        transitionAppearTimeout={350}
        transitionEnterTimeout={350}
        transitionLeaveTimeout={350}
        component="div"
      >
        {this.getGoToBottomButton()}
      </ReactCSSTransitionGroup>
    ];
  }

  getGoToBottomButton() {
    const { highlightText } = this.props;
    const { isAtBottom } = this.state;

    // Do not show go to bottom button, if we are already at the bottom,
    // or we are have highlighted text
    if (isAtBottom || highlightText) {
      return null;
    }

    return (
      <button
        onClick={this.handleGoToBottom}
        className="button go-to-bottom-button"
      >
        Go to bottom
      </button>
    );
  }

  getLogPrepend() {
    if (this.props.hasLoadedTop) {
      return (
        <div className="text-muted">
          (AT BEGINNING OF FILE)
        </div>
      );
    }

    // Show loader since we will start a request for more logs
    return (
      <div className="pod flush-top">
        <Loader innerClassName="loader-small" type="ballSpinFadeLoader" />
      </div>
    );
  }

  render() {
    return (
      <div className="log-view flex flex-direction-top-to-bottom flex-item-grow-1 flex-item-shrink-1">
        {this.getLog()}
      </div>
    );
  }
}

LogView.defaultProps = {
  hasLoadedTop: false,
  highlightText: "",
  fetchPreviousLogs() {},
  onCountChange() {}
};

LogView.propTypes = {
  hasLoadedTop: React.PropTypes.bool,
  highlightText: React.PropTypes.string,
  fetchPreviousLogs: React.PropTypes.func,
  onCountChange: React.PropTypes.func,
  logName: React.PropTypes.string,
  watching: React.PropTypes.number
};

module.exports = LogView;

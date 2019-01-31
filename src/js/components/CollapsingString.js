import isEqual from "lodash.isequal";
import PropTypes from "prop-types";
import React from "react";
import ReactDOM from "react-dom";

import DOMUtils from "../utils/DOMUtils";

const METHODS_TO_BIND = ["updateDimensions"];

class CollapsingString extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      collapsed: false,
      parentWidth: null,
      stringWidth: null
    };

    this.fullStringRef = React.createRef();

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    if (global != null) {
      global.addEventListener("resize", this.updateDimensions);
      global.addEventListener("focus", this.updateDimensions);
    }

    this.updateDimensions();
  }

  componentDidUpdate() {
    this.updateDimensions();
  }

  componentWillUnmount() {
    if (global != null) {
      global.removeEventListener("resize", this.updateDimensions);
      global.removeEventListener("focus", this.updateDimensions);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.parentWidth === null) {
      return false;
    }

    return !isEqual(this.state, nextState) || !isEqual(this.props, nextProps);
  }

  getParentWidth() {
    let parent = null;
    const node = ReactDOM.findDOMNode(this);

    if (node == null) {
      return 0;
    }

    if (this.props.parentSelector != null) {
      parent = DOMUtils.closest(node, this.props.parentSelector);
    } else {
      parent = node.parentNode;
    }

    if (parent == null) {
      parent = global.document.body;
    }

    return DOMUtils.getComputedWidth(parent);
  }

  getStringWidth() {
    if (this.fullStringRef) {
      return DOMUtils.getComputedWidth(this.fullStringRef.current);
    }

    return null;
  }

  shouldCollapse(parentWidth, stringWidth) {
    if (parentWidth == null || stringWidth == null) {
      return false;
    }

    return stringWidth > parentWidth;
  }

  updateDimensions() {
    const parentWidth = this.getParentWidth();

    // Return early if the parent width is 0, or the string isn't collapsed
    // and the parent is growing.
    if (
      parentWidth === 0 ||
      (this.state.parentWidth != null &&
        parentWidth >= this.state.parentWidth &&
        !this.state.collapsed)
    ) {
      return;
    }

    // Return early if the string is collapsed and the parent is shrinking.
    if (
      this.state.parentWidth != null &&
      parentWidth <= this.state.parentWidth &&
      this.state.collapsed
    ) {
      return;
    }

    let stringWidth = null;

    if (this.fullStringRef != null) {
      stringWidth = this.getStringWidth();
    }

    this.setState({
      collapsed: this.shouldCollapse(parentWidth, stringWidth),
      parentWidth,
      stringWidth
    });
  }

  render() {
    const fullString = this.props.string;
    let endLength = this.props.endLength;
    let stringEnding = null;

    if (endLength == null) {
      endLength = Math.floor((fullString.length * 1) / 3);
    }

    if (this.state.collapsed) {
      stringEnding = (
        <span className={this.props.truncatedStringEndClassName}>
          {fullString.substring(fullString.length - endLength)}
        </span>
      );
    }

    return (
      <div className={this.props.wrapperClassName} title={fullString}>
        <span
          className={this.props.fullStringClassName}
          ref={this.fullStringRef}
        >
          {fullString}
        </span>
        <div className={this.props.truncatedWrapperClassName}>
          <span className={this.props.truncatedStringStartClassName}>
            {fullString}
          </span>
          {stringEnding}
        </div>
      </div>
    );
  }
}

CollapsingString.defaultProps = {
  fullStringClassName: "collapsing-string-full-string",
  truncatedStringEndClassName: "collapsing-string-truncated-end",
  truncatedStringStartClassName: "collapsing-string-truncated-start",
  truncatedWrapperClassName: "collapsing-string-truncated-wrapper",
  wrapperClassName: "collapsing-string"
};

CollapsingString.propTypes = {
  // The number of characters to keep visible at the end of the string.
  endLength: PropTypes.number,
  fullStringClassName: PropTypes.string,
  // The selector for the parent whose width should be referenced. By default,
  // the node's direct parent will be used.
  parentSelector: PropTypes.string,
  string: PropTypes.string.isRequired,
  truncatedStringEndClassName: PropTypes.string,
  truncatedStringStartClassName: PropTypes.string,
  truncatedWrapperClassName: PropTypes.string,
  wrapperClassName: PropTypes.string
};

module.exports = CollapsingString;

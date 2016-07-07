import DeepEqual from 'deep-equal';
import React from 'react';
import ReactDOM from 'react-dom';

import DOMUtils from '../utils/DOMUtils';

const METHODS_TO_BIND = ['updateDimensions'];

class CollapsingString extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      collapsed: false,
      parentWidth: null,
      stringWidth: null
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    if (global.window != null) {
      window.addEventListener('resize', this.updateDimensions);
      window.addEventListener('focus', this.updateDimensions);
    }

    this.updateDimensions();
  }

  componentDidUpdate() {
    this.updateDimensions();
  }

  componentWillUnmount() {
    if (global.window != null) {
      window.removeEventListener('resize', this.updateDimensions);
      window.removeEventListener('focus', this.updateDimensions);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.parentWidth === null) {
      return false;
    }

    return !DeepEqual(this.state, nextState)
      || !DeepEqual(this.props, nextProps);
  }

  getParentWidth() {
    let parent = null;
    let node = ReactDOM.findDOMNode(this);

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
    if (this.refs.fullString) {
      return DOMUtils.getComputedWidth(this.refs.fullString);
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
    let parentWidth = this.getParentWidth();

    // Return early if the parent width is 0, or the string isn't collapsed
    // and the parent is growing.
    if (parentWidth === 0 || (this.state.parentWidth != null
      && parentWidth >= this.state.parentWidth && !this.state.collapsed)) {
      return;
    }

    // Return early if the string is collapsed and the parent is shrinking.
    if (this.state.parentWidth != null && parentWidth <= this.state.parentWidth
      && this.state.collapsed) {
      return;
    }

    let stringWidth = null;

    if (this.refs.fullString != null) {
      stringWidth = this.getStringWidth();
    }

    this.setState({
      collapsed: this.shouldCollapse(parentWidth, stringWidth),
      parentWidth,
      stringWidth
    });
  }

  render() {
    let fullString = this.props.string;
    let stringEnding = null;

    if (this.state.collapsed) {
      stringEnding = (
        <span className={this.props.truncatedStringEndClassName}>
          {fullString.substring(fullString.length - this.props.endLength)}
        </span>
      );
    }

    return (
      <div className={this.props.wrapperClassName} title={fullString}>
        <span className={this.props.fullStringClassName} ref="fullString">
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
  endLength: 15,
  fullStringClassName: 'collapsing-string-full-string',
  truncatedStringEndClassName: 'collapsing-string-truncated-end',
  truncatedStringStartClassName: 'collapsing-string-truncated-start',
  truncatedWrapperClassName: 'collapsing-string-truncated-wrapper',
  wrapperClassName: 'collapsing-string'
};

CollapsingString.propTypes = {
  // The number of characters to keep visible at the end of the string.
  endLength: React.PropTypes.number,
  fullStringClassName: React.PropTypes.string,
  // The selector for the parent whose width should be referenced. By default,
  // the node's direct parent will be used.
  parentSelector: React.PropTypes.string,
  string: React.PropTypes.string.isRequired,
  truncatedStringEndClassName: React.PropTypes.string,
  truncatedStringStartClassName: React.PropTypes.string,
  truncatedWrapperClassName: React.PropTypes.string,
  wrapperClassName: React.PropTypes.string
};

module.exports = CollapsingString;

import Clipboard from "clipboard";
import React, { PropTypes } from "react";
import ReactDOM from "react-dom";
import { Tooltip } from "reactjs-components";

import Icon from "./Icon";

const METHODS_TO_BIND = ["handleCopy", "handleCopyIconMouseEnter"];

class ClipboardTrigger extends React.Component {
  constructor() {
    super();

    this.state = {
      hasCopiedToClipboard: false
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    if (this.refs.copyButton) {
      this.clipboard = new Clipboard(
        ReactDOM.findDOMNode(this.refs.copyButton),
        {
          text: () => {
            return this.props.copyText;
          }
        }
      );

      this.clipboard.on("success", this.handleCopy);
    }
  }

  componentWillUnmount() {
    if (this.clipboard) {
      this.clipboard.destroy();
    }
  }

  getTriggerContent() {
    const { children, className } = this.props;

    if (children != null) {
      return (
        <span
          className={className}
          onMouseEnter={this.handleCopyIconMouseEnter}
          ref="copyButton"
        >
          {children}
        </span>
      );
    }

    return (
      <Icon
        id="clipboard"
        size="mini"
        className={`clickable icon-clipboard ${className}`}
        color="purple"
        onMouseEnter={this.handleCopyIconMouseEnter}
        ref="copyButton"
      />
    );
  }

  handleCopy() {
    this.setState({ hasCopiedToClipboard: true });

    if (this.props.onTextCopy) {
      this.props.onTextCopy();
    }
  }

  handleCopyIconMouseEnter() {
    this.setState({ hasCopiedToClipboard: false });
  }

  render() {
    const { copiedText, tooltipContent, useTooltip } = this.props;
    const { hasCopiedToClipboard } = this.state;

    if (useTooltip) {
      const text = hasCopiedToClipboard ? copiedText : tooltipContent;

      return (
        <Tooltip position="bottom" content={text}>
          {this.getTriggerContent()}
        </Tooltip>
      );
    }

    return this.getTriggerContent();
  }
}

ClipboardTrigger.defaultProps = {
  copiedText: "Copied!",
  tooltipContent: "Copy to clipboard"
};

ClipboardTrigger.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  copiedText: PropTypes.node,
  copyText: PropTypes.node,
  onTextCopy: PropTypes.func,
  tooltipContent: PropTypes.node,
  useTooltip: PropTypes.bool
};

module.exports = ClipboardTrigger;

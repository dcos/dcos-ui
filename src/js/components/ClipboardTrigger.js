import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import Clipboard from "clipboard";
import PropTypes from "prop-types";
import React from "react";
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
    const { useTooltip } = this.props;
    const { hasCopiedToClipboard } = this.state;

    if (useTooltip) {
      const tooltipContent = hasCopiedToClipboard
        ? i18nMark("Copied!")
        : i18nMark("Copy to clipboard");

      return (
        <Tooltip
          position="bottom"
          content={<Trans id={tooltipContent} render="span" />}
        >
          {this.getTriggerContent()}
        </Tooltip>
      );
    }

    return this.getTriggerContent();
  }
}

ClipboardTrigger.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  copyText: PropTypes.string,
  onTextCopy: PropTypes.func,
  useTooltip: PropTypes.bool
};

module.exports = ClipboardTrigger;

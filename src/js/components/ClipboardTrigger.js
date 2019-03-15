import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import Clipboard from "clipboard";
import PropTypes from "prop-types";
import React from "react";
import { Tooltip } from "reactjs-components";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXs,
  purple
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

const METHODS_TO_BIND = ["handleCopy", "handleCopyIconMouseEnter"];

class ClipboardTrigger extends React.Component {
  constructor() {
    super();

    this.state = {
      hasCopiedToClipboard: false
    };

    this.copyButtonRef = React.createRef();

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    if (this.copyButtonRef) {
      this.clipboard = new Clipboard(this.copyButtonRef.current, {
        text: () => {
          return this.props.copyText;
        }
      });

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
          ref={this.copyButtonRef}
        >
          {children}
        </span>
      );
    }

    return (
      <span
        className={`clickable icon-clipboard ${className}`}
        onMouseEnter={this.handleCopyIconMouseEnter}
        ref={this.copyButtonRef}
      >
        <Icon shape={SystemIcons.Clipboard} size={iconSizeXs} color={purple} />
      </span>
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

export default ClipboardTrigger;

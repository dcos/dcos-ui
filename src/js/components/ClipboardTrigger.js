import browserInfo from 'browser-info';
import Clipboard from 'clipboard';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import {Tooltip} from 'reactjs-components';

import Icon from './Icon';

const METHODS_TO_BIND = [
  'handleCopy',
  'handleCopyIconMouseEnter'
];

class ClipboardTrigger extends React.Component {
  constructor() {
    super();

    this.state = {
      hasCopiedToClipboard: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    if (this.refs.copyButton) {
      this.clipboard = new Clipboard(ReactDOM.findDOMNode(this.refs.copyButton),
        {
          text: () => {
            return this.props.copyText;
          }
        }
      );

      this.clipboard.on('success', this.handleCopy);
    }
  }

  componentWillUnmount() {
    if (this.clipboard) {
      this.clipboard.destroy();
    }
  }

  handleCopy() {
    this.setState({hasCopiedToClipboard: true});
  }

  handleCopyIconMouseEnter() {
    this.setState({hasCopiedToClipboard: false});
  }

  render() {
    if (/safari/i.test(browserInfo().name)) {
      return null;
    }

    let {copiedText, tooltipContent} = this.props;
    let clipboardIcon = (
      <Icon
        family="mini"
        id="clipboard"
        size="mini"
        className="clickable icon-clipboard"
        color="purple"
        onMouseEnter={this.handleCopyIconMouseEnter} />
    );
    let text = tooltipContent;

    if (this.state.hasCopiedToClipboard) {
      text = copiedText;
    }

    return (
      <Tooltip position="bottom" content={text} ref="copyButton">
        {clipboardIcon}
      </Tooltip>
    );
  }
}

ClipboardTrigger.defaultProps = {
  copiedText: 'Copied!',
  tooltipContent: 'Copy to clipboard'
};

ClipboardTrigger.propTypes = {
  copiedText: PropTypes.string,
  copyText: PropTypes.string,
  tooltipContent: PropTypes.string
};

module.exports = ClipboardTrigger;

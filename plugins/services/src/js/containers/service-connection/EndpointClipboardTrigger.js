import PropTypes from "prop-types";
import React from "react";
import ClipboardTrigger from "#SRC/js/components/ClipboardTrigger";
import Icon from "#SRC/js/components/Icon";

class EndpointClipboardTrigger extends React.Component {
  render() {
    const { command } = this.props;

    return (
      <div className="code-copy-wrapper">
        <div className="code-copy-icon tight">
          <ClipboardTrigger
            className="clickable"
            copyText={command}
            useTooltip={true}
          >
            <Icon id="clipboard" size="mini" color="light-grey" />
          </ClipboardTrigger>
        </div>
        {command}
      </div>
    );
  }
}

EndpointClipboardTrigger.propTypes = {
  command: PropTypes.string.isRequired
};

module.exports = EndpointClipboardTrigger;

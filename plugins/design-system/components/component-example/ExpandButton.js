import React, { Component } from "react";

import Icon from "#SRC/js/components/Icon";

class ExpandButton extends Component {
  render() {
    return (
      <button
        className="button button-link"
        type="button"
        onClick={this.props.onClick}
      >
        Show more
        <Icon size="mini" id="caret-down" />
      </button>
    );
  }
}

ExpandButton.propTypes = {
  onClick: React.PropTypes.func.isRequired
};

module.exports = ExpandButton;

import React, { Component } from "react";

import Icon from "#SRC/js/components/Icon";

class CollapseButton extends Component {
  render() {
    return (
      <button
        className="button button-link"
        type="button"
        onClick={this.props.onClick}
      >
        Show less
        <Icon size="mini" id="caret-up" />
      </button>
    );
  }
}

CollapseButton.propTypes = {
  onClick: React.PropTypes.func.isRequired
};

module.exports = CollapseButton;

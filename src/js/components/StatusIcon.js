import React, { PropTypes, Component } from "react";

import Icon from "#SRC/js/components/Icon";

const ICONS_STATE = {
  RUNNING: {
    id: "circle-check",
    color: "green"
  },
  TRANSITION: {
    id: "spinner",
    color: "grey"
  },
  STOPPED: {
    id: "circle-minus",
    color: "grey"
  },
  WARNING: {
    id: "yield",
    color: "yellow"
  }
};

/**
 * Status Icon is meant to be used across
 * the application where it need to display any of the state below
 * All green (RUNNING), transition (DEPLOYING, RECOVERING), Warning
 *
 * @class StatusIcon
 * @extends {Component}
 */
class StatusIcon extends Component {
  render() {
    const state = this.props.state.toUpperCase();
    const iconState = ICONS_STATE[state];

    if (iconState == null) {
      return null;
    }

    return (
      <Icon
        className={iconState.id}
        color={iconState.color}
        id={iconState.id}
        size="mini"
      />
    );
  }
}

StatusIcon.propTypes = {
  label: PropTypes.string.isRequired
};

export default StatusIcon;

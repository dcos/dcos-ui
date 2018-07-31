import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

class UserAccountDropdownTrigger extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.store_listeners = [
      {
        name: "metadata",
        events: ["success"],
        listenAlways: false
      }
    ];
  }

  componentDidUpdate() {
    if (this.props.onUpdate) {
      this.props.onUpdate();
    }
  }

  render() {
    const { content, onTrigger } = this.props;

    return (
      <span className="header-bar-dropdown-trigger" onClick={onTrigger}>
        <span className="header-bar-dropdown-trigger-content text-overflow">
          {content}
        </span>
      </span>
    );
  }
}

UserAccountDropdownTrigger.propTypes = {
  content: PropTypes.string.isRequired,
  onUpdate: PropTypes.func,
  onTrigger: PropTypes.func
};

module.exports = UserAccountDropdownTrigger;

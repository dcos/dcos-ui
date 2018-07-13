import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";
import UserAccountDropdownTriggerContent from "./UserAccountDropdownTriggerContent";

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
    return (
      <UserAccountDropdownTriggerContent
        {...this.props}
        onClick={this.props.onTrigger}
      />
    );
  }
}

UserAccountDropdownTrigger.defaultProps = {
  showCaret: false,
  onTrigger() {}
};

UserAccountDropdownTrigger.propTypes = {
  clusterName: PropTypes.node,
  onUpdate: PropTypes.func,
  showCaret: PropTypes.bool
};

module.exports = UserAccountDropdownTrigger;

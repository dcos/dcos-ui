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
    return React.cloneElement(this.props.children, {
      onClick: this.props.onTrigger
    });
  }
}

UserAccountDropdownTrigger.defaultProps = {
  showCaret: false,
  onTrigger() {}
};

UserAccountDropdownTrigger.propTypes = {
  children: PropTypes.element.isRequired
};

module.exports = UserAccountDropdownTrigger;

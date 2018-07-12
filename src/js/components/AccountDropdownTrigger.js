import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

class AccountDropdownTrigger extends mixin(StoreMixin) {
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

    // TODO: DCOS-38944
    return (
      <a className="header-bar-dropdown" onClick={onTrigger}>
        <span>{content}</span>
      </a>
    );
  }
}

AccountDropdownTrigger.propTypes = {
  content: PropTypes.string.isRequired,
  onUpdate: PropTypes.func,
  onTrigger: PropTypes.func
};

module.exports = AccountDropdownTrigger;

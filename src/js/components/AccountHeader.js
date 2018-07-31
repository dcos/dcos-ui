import { MountService } from "foundation-ui";
import React from "react";
import { routerShape } from "react-router";

class AccountHeader extends React.Component {
  render() {
    return (
      <MountService.Mount
        type="Header:UserAccountDropdown"
        limit={1}
        onUpdate={this.props.onUpdate}
      />
    );
  }
}

AccountHeader.contextTypes = {
  router: routerShape
};

module.exports = AccountHeader;

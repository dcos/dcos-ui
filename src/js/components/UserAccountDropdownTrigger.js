import mixin from "reactjs-mixin";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

import Icon from "./Icon";

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
    let { primaryContent, secondaryContent = null } = this.props;

    // Promote secondary content to primary content in the event that secondary
    // is the only available content.
    if (!primaryContent && secondaryContent) {
      primaryContent = secondaryContent;
      secondaryContent = null;
    } else if (secondaryContent) {
      secondaryContent = (
        <div className="cluster-header-secondary">
          {secondaryContent}
        </div>
      );
    }

    return (
      <div className="cluster-header">
        <div className="cluster-header-primary-wrapper">
          <h5 className="cluster-header-primary inverse text-overflow flush">
            {primaryContent}
          </h5>
          <Icon family="tiny" id="triangle-down" key="caret" size="tiny" />
        </div>
        {secondaryContent}
      </div>
    );
  }
}

UserAccountDropdownTrigger.defaultProps = {
  showCaret: false
};

UserAccountDropdownTrigger.propTypes = {
  clusterName: React.PropTypes.node,
  onUpdate: React.PropTypes.func,
  showCaret: React.PropTypes.bool
};

module.exports = UserAccountDropdownTrigger;

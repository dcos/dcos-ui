import mixin from "reactjs-mixin";
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
      <header className="header" onClick={this.props.onTrigger}>
        <a className="header-dropdown">
          <div className="header-content">
            <div className="header-image-wrapper">
              <div className="header-image" />
            </div>
            <div className="header-details">
              <span className="header-title">
                <span>
                  {primaryContent}
                </span>
              </span>
              <span className="header-subtitle">
                {secondaryContent}
              </span>
            </div>
          </div>
        </a>
      </header>
    );
  }
}

UserAccountDropdownTrigger.defaultProps = {
  showCaret: false,
  onTrigger() {}
};

UserAccountDropdownTrigger.propTypes = {
  clusterName: React.PropTypes.node,
  onUpdate: React.PropTypes.func,
  showCaret: React.PropTypes.bool
};

module.exports = UserAccountDropdownTrigger;

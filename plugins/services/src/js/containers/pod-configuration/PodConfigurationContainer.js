import React from "react";

import Pod from "../../structs/Pod";
import ServiceConfigDisplay
  from "../../service-configuration/ServiceConfigDisplay";

class PodConfigurationTabView extends React.Component {
  render() {
    const spec = this.props.pod.getSpec();
    const localeVersion = new Date(spec.getVersion()).toLocaleString();

    return (
      <div className="container">
        <h3 className="flush-top">
          Current Version ({localeVersion})
        </h3>
        <ServiceConfigDisplay appConfig={spec} />
      </div>
    );
  }
}

PodConfigurationTabView.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodConfigurationTabView;

import PropTypes from "prop-types";
import React from "react";
import { Trans, DateFormat } from "@lingui/macro";

import Pod from "../../structs/Pod";
import ServiceConfigDisplay from "../../service-configuration/ServiceConfigDisplay";

class PodConfigurationTabView extends React.Component {
  render() {
    const spec = this.props.pod.getSpec();
    const localeVersion = (
      <DateFormat
        value={new Date(spec.getVersion())}
        format={{
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric"
        }}
      />
    );

    // TODO (DCOS_OSS-1037): Implement ability to edit a Pod
    return (
      <div className="container">
        <Trans render="h3" className="flush-top">
          Current Version ({localeVersion})
        </Trans>
        <ServiceConfigDisplay appConfig={spec} />
      </div>
    );
  }
}

PodConfigurationTabView.propTypes = {
  pod: PropTypes.instanceOf(Pod)
};

module.exports = PodConfigurationTabView;

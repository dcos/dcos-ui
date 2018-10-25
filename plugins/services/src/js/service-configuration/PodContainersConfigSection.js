import PropTypes from "prop-types";
import React from "react";
import { Trans } from "@lingui/macro";
import { InfoBoxInline } from "@dcos/ui-kit";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import PodContainerConfigSection from "./PodContainerConfigSection";

function renderContainers(appConfig, handleEditClick) {
  const { containers = [] } = appConfig;

  return containers.map((container, index) => {
    return (
      <PodContainerConfigSection
        appConfig={appConfig}
        containerConfig={container}
        key={`pod-container-${container.name}`}
        onEditClick={handleEditClick}
        index={index}
      />
    );
  });
}

const PodContainersConfigSection = ({ appConfig, onEditClick }) => {
  if (!appConfig.containers || !appConfig.containers.length) {
    return (
      <div>
        <ConfigurationMapHeading level={2}>Containers</ConfigurationMapHeading>
        <InfoBoxInline
          appearance="danger"
          message={
            <Trans render="span">
              No containers specified! Please specify at least one container
              when creating a multi-container definition!
            </Trans>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <Trans render={<ConfigurationMapHeading level={2} />}>Containers</Trans>
      {renderContainers(appConfig, onEditClick)}
    </div>
  );
};

PodContainersConfigSection.propTypes = {
  onEditClick: PropTypes.func
};

module.exports = PodContainersConfigSection;

import * as React from "react";
import { Trans } from "@lingui/macro";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";

import { getContainerNameWithIcon } from "#PLUGINS/services/src/js/utils/ServiceConfigDisplayUtil";

export interface SecretContainerFileExposure {
  containerName: string;
  containerPath: string;
}

export interface SecretPodFileExposure {
  secretPath: string;
  containers: SecretContainerFileExposure[];
}

interface Props {
  onEditClick: () => void;
  secretExposures: SecretPodFileExposure[];
}

function ServiceConfigSecretsExposedAsFile({
  onEditClick,
  secretExposures
}: Props) {
  if (secretExposures.length === 0) {
    return null;
  }

  let action: React.ReactNode = null;

  if (onEditClick) {
    action = (
      <a
        className="button button-link flush table-display-on-row-hover"
        onClick={onEditClick.bind(null, { tabViewID: "secrets" })}
      >
        Edit
      </a>
    );
  }

  return (
    <ConfigurationMapSection>
      <Trans render={<ConfigurationMapHeading level={1} />}>
        Secrets Exposed as File
      </Trans>

      {secretExposures.map((se: SecretPodFileExposure) => {
        return (
          <React.Fragment key={`secret-${se.secretPath}`}>
            <ConfigurationMapHeading level={2}>
              {se.secretPath}
            </ConfigurationMapHeading>
            {se.containers.map((exposure: SecretContainerFileExposure) => {
              return (
                <React.Fragment key={`secret-${exposure.containerName}`}>
                  <ConfigurationMapRow>
                    <ConfigurationMapLabel>
                      {getContainerNameWithIcon({
                        name: exposure.containerName
                      })}
                    </ConfigurationMapLabel>
                    <ConfigurationMapValue
                      value={<code>{exposure.containerPath}</code>}
                    />
                    {action}
                  </ConfigurationMapRow>
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
    </ConfigurationMapSection>
  );
}

export { ServiceConfigSecretsExposedAsFile as default };

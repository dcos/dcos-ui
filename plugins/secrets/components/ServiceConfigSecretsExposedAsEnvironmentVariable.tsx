import * as React from "react";
import { Trans } from "@lingui/macro";

import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";

export interface SecretEnvExposure {
  secretPath: string;
  exposures: string[];
}

interface Props {
  onEditClick: () => void;
  secretExposures: SecretEnvExposure[];
}

function ServiceConfigSecretsExposedAsEnvironmentVariable({
  onEditClick,
  secretExposures,
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
      <ConfigurationMapHeading level={1}>
        <Trans>Secrets Exposed as Environment</Trans>
      </ConfigurationMapHeading>

      {secretExposures.map((se: SecretEnvExposure) => {
        return (
          <React.Fragment key={`secret-${se.secretPath}`}>
            <ConfigurationMapHeading level={2}>
              {se.secretPath}
            </ConfigurationMapHeading>

            {se.exposures.map((envExp) => {
              return (
                <ConfigurationMapRow key={`secret-${envExp}`}>
                  <Trans render={<ConfigurationMapLabel />}>
                    Environment Name
                  </Trans>
                  <ConfigurationMapValue value={<span>{envExp}</span>} />
                  {action}
                </ConfigurationMapRow>
              );
            })}
          </React.Fragment>
        );
      })}
    </ConfigurationMapSection>
  );
}

export { ServiceConfigSecretsExposedAsEnvironmentVariable as default };

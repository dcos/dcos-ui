import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "reactjs-components";

import MetadataStore from "#SRC/js/stores/MetadataStore";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import FormGroup from "#SRC/js/components/form/FormGroup";
import AddButton from "#SRC/js/components/form/AddButton";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";

import getSecretStore from "../../stores/SecretStore";
import { SECRET_STORE_SECRETS_SUCCESS } from "../../constants/EventTypes";
import SecretsValidators from "../../validators/SecretsValidators";

import MultiContainerSecret from "./MultiContainerSecret";

const SecretStore = getSecretStore();

class MultiContainerSecretsFormSection extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      secrets: PropTypes.arrayOf(
        PropTypes.shape({
          environmentVars: PropTypes.arrayOf(PropTypes.string),
          key: PropTypes.string,
          value: PropTypes.string,
        })
      ),
    }).isRequired,
    errors: PropTypes.shape({
      secrets: PropTypes.arrayOf(
        PropTypes.oneOf([
          PropTypes.string,
          PropTypes.shape({ source: PropTypes.string }),
        ])
      ),
    }).isRequired,
    onAddItem: PropTypes.func.isRequired,
    onRemoveItem: PropTypes.func.isRequired,
  };
  state = { secrets: SecretStore.getSecrets() };
  constructor(props) {
    super(props);

    this.getSecretsLines = this.getSecretsLines.bind(this);
    this.onStoreSuccess = this.onStoreSuccess.bind(this);
    this.getAllVolumeMountCounts = this.getAllVolumeMountCounts.bind(this);
    this.getEnvVarNameCounts = this.getEnvVarNameCounts.bind(this);
    this.getErrors = this.getErrors.bind(this);
  }

  componentDidMount() {
    SecretStore.fetchSecrets();
    SecretStore.addListener(SECRET_STORE_SECRETS_SUCCESS, this.onStoreSuccess);
  }

  componentWillUnmount() {
    SecretStore.removeListener(
      SECRET_STORE_SECRETS_SUCCESS,
      this.onStoreSuccess
    );
  }

  onStoreSuccess() {
    this.setState({ secrets: SecretStore.getSecrets() });
  }

  getAllVolumeMountCounts() {
    const containers = this.props.data.containers || [];
    const secrets = this.props.data.secrets || [];
    const volumeMounts = this.props.data.volumeMounts || [];

    let volumeCounts = containers.map(() => []);
    volumeCounts = secrets.reduce((volumes, secret) => {
      secret.exposures.forEach((exposure) => {
        if (exposure.type === "file") {
          exposure.mounts.forEach((mountPath, containerIndex) => {
            if (!mountPath || mountPath.length === 0) {
              return;
            }
            if (volumes[containerIndex][mountPath]) {
              volumes[containerIndex][mountPath]++;
            } else {
              volumes[containerIndex][mountPath] = 1;
            }
          });
        }
      });

      return volumes;
    }, volumeCounts);
    volumeCounts = volumeMounts.reduce((volumeCounts, volume) => {
      volume.mountPath.forEach((mountPath, containerIndex) => {
        if (!mountPath || mountPath.length === 0) {
          return;
        }
        if (volumeCounts[containerIndex][mountPath]) {
          volumeCounts[containerIndex][mountPath]++;
        } else {
          volumeCounts[containerIndex][mountPath] = 1;
        }
      });

      return volumeCounts;
    }, volumeCounts);

    return volumeCounts;
  }

  getEnvVarNameCounts() {
    const secrets = this.props.data.secrets || [];
    const env = this.props.data.env || [];
    const envCounts = {};

    secrets.forEach((secret) => {
      secret.exposures
        .filter((exposure) => exposure.type === "envVar")
        .filter((exposure) => exposure.value && exposure.value.length > 0)
        .forEach((exposure) => {
          if (envCounts[exposure.value]) {
            envCounts[exposure.value]++;
          } else {
            envCounts[exposure.value] = 1;
          }
        });
    });
    env
      .filter((envVar) => envVar.key && envVar.key.length > 0)
      .forEach((envVar) => {
        if (envCounts[envVar.key]) {
          envCounts[envVar.key]++;
        } else {
          envCounts[envVar.key] = 1;
        }
      });

    return envCounts;
  }

  getErrors() {
    // Don't generate errors if we aren't showing errors
    if (Object.keys(this.props.errors).length === 0) {
      return {};
    }

    const data = this.props.data.secrets || [];
    const errors = this.props.errors.secrets || {};
    const volumeCounts = this.getAllVolumeMountCounts();
    const envVarCounts = this.getEnvVarNameCounts();
    const secretErrors = Object.keys(errors).reduce((result, key) => {
      let error = errors[key];
      if (error && typeof error !== "string" && error.source) {
        error = error.source;
      } else if (typeof error === "string") {
        error = <Trans id={error} />;
      }
      result[key] = [error];

      return result;
    }, {});
    data.forEach((secret, secretIndex) => {
      secret.exposures.forEach((exposure, exposureIndex) => {
        const exposureKey = `secrets.${secretIndex}.exposures.${exposureIndex}`;
        if (exposure.type === "file") {
          exposure.mounts.forEach((mountPath, containerIndex) => {
            const fieldName = `${exposureKey}.mounts.${containerIndex}`;
            const fieldErrors = [];
            if (volumeCounts[containerIndex][mountPath] > 1) {
              fieldErrors.push(
                <Trans key="duplicateError">
                  Name already in use by another secret for this container.
                </Trans>
              );
            }
            if (!SecretsValidators.validSecretContainerPath(mountPath)) {
              fieldErrors.push(
                <Trans key="syntaxError">Invalid syntax.</Trans>
              );
            }

            if (fieldErrors.length > 0) {
              secretErrors[fieldName] = fieldErrors;
            }
          });
        } else if (
          exposure.type === "envVar" &&
          envVarCounts[exposure.value] > 1
        ) {
          secretErrors[`${exposureKey}.value`] = [
            <Trans key="duplicateError">Name already in use.</Trans>,
          ];
        }
      });
    });

    return secretErrors;
  }

  getSecretsLines(data, showErrors, errors) {
    const secrets = this.state.secrets.map((secret) => secret.getPath());

    return data.map((secret, secretIndex) => {
      const containers = this.props.data.containers || [];

      const exposures =
        secret.exposures.length === 0
          ? [{ type: "", value: "" }]
          : secret.exposures;

      return exposures.map((variable, variableIndex) => (
        <MultiContainerSecret
          key={`secret.${secretIndex}.${variableIndex}`}
          secretIndex={secretIndex}
          variableIndex={variableIndex}
          secret={secret}
          variable={variable}
          secrets={secrets}
          containers={containers}
          showErrors={showErrors}
          errors={errors}
          onRemoveItem={this.props.onRemoveItem}
        />
      ));
    });
  }

  render() {
    const data = this.props.data.secrets || [];
    const showErrors = Object.keys(this.props.errors).length > 0;
    const errors = this.getErrors();

    const tooltipContent = (
      <Trans render="span">
        To use a secret in an application, a user needs appropriate permissions.{" "}
        <a
          href={MetadataStore.buildDocsURI("/security/ent/secrets/")}
          target="_blank"
        >
          More information
        </a>
        .
      </Trans>
    );

    return (
      <div>
        <h1 className="flush-top short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true} title="Secrets">
              <Trans>Secrets</Trans>{" "}
              <Tooltip
                content={tooltipContent}
                interactive={true}
                maxWidth={300}
                wrapText={true}
              >
                <InfoTooltipIcon />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h1>
        <Trans render="p">
          Use the{" "}
          <a
            href={MetadataStore.buildDocsURI("/security/ent/secrets/")}
            target="_blank"
          >
            DC/OS Secret Store
          </a>{" "}
          to secure important values like private keys, API tokens, and database
          passwords.
        </Trans>
        {this.getSecretsLines(data, showErrors, errors)}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton
              onClick={() =>
                this.props.onAddItem({
                  path: "secrets",
                  value: {
                    key: null,
                    value: null,
                    exposures: [{ type: "", value: "" }],
                  },
                })
              }
            >
              <Trans render="span">Add Secret</Trans>
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

export default MultiContainerSecretsFormSection;

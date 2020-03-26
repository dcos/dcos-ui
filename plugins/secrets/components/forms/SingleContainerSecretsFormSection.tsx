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
import * as EventTypes from "../../constants/EventTypes";

import SingleContainerSecret from "./SingleContainerSecret";
import SecretsValidators from "../../validators/SecretsValidators";

const SecretStore = getSecretStore();
const { SECRET_STORE_SECRETS_SUCCESS } = EventTypes;

function getNewID(data, index = data.length) {
  return !data.find((item) => item.key === `secret${index}`)
    ? `secret${index}`
    : getNewID(data, index + 1);
}

class SingleContainerSecretsFormSection extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      secrets: PropTypes.arrayOf(
        PropTypes.shape({
          exposures: PropTypes.arrayOf(
            PropTypes.shape({
              type: PropTypes.oneOf(["", "file", "envVar"]),
              value: PropTypes.string,
            })
          ),
          key: PropTypes.string,
          value: PropTypes.string,
        })
      ),
    }).isRequired,
    errors: PropTypes.shape({
      secrets: PropTypes.object,
    }).isRequired,
    onAddItem: PropTypes.func.isRequired,
    onRemoveItem: PropTypes.func.isRequired,
  };

  state = { secrets: SecretStore.getSecrets() };

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
  onStoreSuccess = () => {
    this.setState({ secrets: SecretStore.getSecrets() });
  };
  getSecretsLines = (data, showErrors, errors) => {
    const secrets = this.state.secrets.map((secret) => secret.getPath());

    return data.map((secret, secretIndex) => {
      const exposures =
        secret.exposures.length === 0
          ? [{ type: "", value: "" }]
          : secret.exposures;

      return exposures.map((exposure, variableIndex) => (
        <SingleContainerSecret
          key={`secrets.${secretIndex}.${variableIndex}`}
          secretIndex={secretIndex}
          variableIndex={variableIndex}
          secret={secret}
          variable={exposure}
          showErrors={showErrors}
          errors={errors}
          secrets={secrets}
          onRemoveItem={this.props.onRemoveItem}
        />
      ));
    });
  };
  getErrors = () => {
    // Don't generate errors if we aren't showing errors
    if (Object.keys(this.props.errors).length === 0) {
      return {};
    }

    const data = this.props.data.secrets || [];
    const errors = this.props.errors.secrets || {};

    const valueCounts = data.reduce(
      (counts, secret) => {
        secret.exposures.forEach((exposure) => {
          if (exposure.type === "") {
            return;
          }
          if (!exposure.value || exposure.value.length === 0) {
            return;
          }
          if (counts[exposure.type][exposure.value]) {
            counts[exposure.type][exposure.value]++;
          } else {
            counts[exposure.type][exposure.value] = 1;
          }
        });

        return counts;
      },
      { envVar: {}, file: {} }
    );

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
        const expErrors = [];
        const exposureKey = `secrets.${secretIndex}.exposures.${exposureIndex}.value`;
        if (
          exposure.value &&
          exposure.type &&
          valueCounts[exposure.type][exposure.value] > 1
        ) {
          expErrors.push(
            <Trans key="duplicateError">
              Name already in use by another secret for this service.
            </Trans>
          );
        }
        if (
          exposure.type === "file" &&
          exposure.value &&
          !SecretsValidators.validSecretContainerPath(exposure.value)
        ) {
          expErrors.push(<Trans key="syntaxError">Invalid syntax.</Trans>);
        }

        if (expErrors.length > 0) {
          secretErrors[exposureKey] = expErrors;
        }
      });
    });

    return secretErrors;
  };

  render() {
    const data = this.props.data.secrets || [];
    const showErrors = Object.keys(this.props.errors).length > 0;
    const errors = this.getErrors();
    const secretsLines = this.getSecretsLines(data, showErrors, errors);

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
        {secretsLines}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton
              onClick={() =>
                this.props.onAddItem({
                  path: "secrets",
                  value: {
                    key: getNewID(data),
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

export default SingleContainerSecretsFormSection;

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

import JobSecret from "./JobSecret";

const SecretStore = getSecretStore();

class JobSecretsFormSection extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      secrets: PropTypes.arrayOf(
        PropTypes.shape({
          exposureType: PropTypes.string,
          exposureValue: PropTypes.string,
          key: PropTypes.string,
          secretPath: PropTypes.string
        })
      )
    }).isRequired,
    errors: PropTypes.arrayOf(
      PropTypes.shape({
        message: PropTypes.string,
        path: PropTypes.arrayOf(PropTypes.string)
      })
    ),
    onAddItem: PropTypes.func.isRequired,
    onRemoveItem: PropTypes.func.isRequired
  };
  constructor(props) {
    super(props);

    this.state = {
      secrets: SecretStore.getSecrets().getItems()
    };
  }

  componentDidMount() {
    SecretStore.addListener(
      EventTypes.SECRET_STORE_SECRETS_SUCCESS,
      this.onStoreSuccess
    );
    SecretStore.fetchSecrets();
  }

  componentWillUnmount() {
    SecretStore.removeListener(
      EventTypes.SECRET_STORE_SECRETS_SUCCESS,
      this.onStoreSuccess
    );
  }
  onStoreSuccess = () => {
    this.setState({ secrets: SecretStore.getSecrets().getItems() });
  };
  getSecretsLines = (data, errors) => {
    const secrets = this.state.secrets.map(secret => secret.getPath());
    const valueCounts = data.reduce(
      (counts, secret) => {
        if (secret.exposureType === "") {
          return counts;
        }
        if (!secret.exposureValue || secret.exposureValue.length === 0) {
          return counts;
        }
        if (counts[secret.exposureType][secret.exposureValue]) {
          counts[secret.exposureType][secret.exposureValue]++;
        } else {
          counts[secret.exposureType][secret.exposureValue] = 1;
        }

        return counts;
      },
      { envVar: {}, file: {} }
    );

    return data.map((secret, secretIndex) => {
      const isValueWithoutKey = Boolean(
        !secret.secretPath && secret.exposureValue
      );

      const isDuplicate =
        Boolean(secret.exposureType) &&
        Boolean(secret.exposureValue) &&
        valueCounts[secret.exposureType][secret.exposureValue] > 1;

      return (
        <JobSecret
          key={`secret.${secretIndex}`}
          secretIndex={secretIndex}
          secret={secret}
          errors={errors}
          valueWithoutKey={isValueWithoutKey}
          duplicateValue={isDuplicate}
          secrets={secrets}
          onRemoveItem={this.props.onRemoveItem}
          showErrors={this.props.showErrors}
        />
      );
    });
  };

  render() {
    const data = this.props.data.secrets || [];
    const errors = this.props.errors || [];
    const secretsLines = this.getSecretsLines(data, errors);

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
            <AddButton onClick={this.props.onAddItem("job.run.secrets")}>
              <Trans render="span">Add Secret</Trans>
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

export default JobSecretsFormSection;

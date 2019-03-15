import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Tooltip } from "reactjs-components";
import Objektiv from "objektiv";

import AddButton from "#SRC/js/components/form/AddButton";
import AdvancedSection from "#SRC/js/components/form/AdvancedSection";
import AdvancedSectionContent from "#SRC/js/components/form/AdvancedSectionContent";
import AdvancedSectionLabel from "#SRC/js/components/form/AdvancedSectionLabel";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldTextarea from "#SRC/js/components/form/FieldTextarea";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupContainer from "#SRC/js/components/form/FormGroupContainer";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

import {
  MESOS_HTTP,
  MESOS_HTTPS,
  COMMAND
} from "../../constants/HealthCheckProtocols";
import { FormReducer as healthChecks } from "../../reducers/serviceForm/FormReducers/HealthChecks";
import HealthCheckUtil from "../../utils/HealthCheckUtil";

const errorsLens = Objektiv.attr("healthChecks", []);

class HealthChecksFormSection extends Component {
  getAdvancedSettings(healthCheck, key) {
    if (
      healthCheck.protocol !== COMMAND &&
      healthCheck.protocol !== MESOS_HTTP &&
      healthCheck.protocol !== MESOS_HTTPS
    ) {
      return null;
    }

    const errors = errorsLens.at(key, {}).get(this.props.errors);

    const gracePeriodHelpText = (
      <Trans render="span">
        (Optional. Default: 300): Health check failures are ignored within this
        number of seconds or until the instance becomes healthy for the first
        time.
      </Trans>
    );

    const intervalHelpText = (
      <Trans render="span">
        (Optional. Default: 60): Number of seconds to wait between health
        checks.
      </Trans>
    );

    const timeoutHelpText = (
      <Trans render="span">
        (Optional. Default: 20): Number of seconds after which a health check is
        considered a failure regardless of the response.
      </Trans>
    );

    const failuresHelpText = (
      <Trans render="span">
        (Optional. Default: 3): Number of consecutive health check failures
        after which the unhealthy instance should be killed. HTTP & TCP health
        checks: If this value is 0, instances will not be killed if they fail
        the health check.
      </Trans>
    );

    return (
      <AdvancedSection>
        <AdvancedSectionLabel>
          <Trans render="span">Advanced Health Check Settings</Trans>
        </AdvancedSectionLabel>
        <AdvancedSectionContent>
          <FormRow>
            <FormGroup
              className="column-3"
              showError={Boolean(errors.gracePeriodSeconds)}
            >
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    <Trans render="span">Grace Period (s)</Trans>
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent>
                    <Tooltip
                      content={gracePeriodHelpText}
                      interactive={true}
                      maxWidth={300}
                      wrapText={true}
                    >
                      <InfoTooltipIcon />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldAutofocus>
                <FieldInput
                  name={`healthChecks.${key}.gracePeriodSeconds`}
                  type="number"
                  min="0"
                  placeholder="300"
                  value={healthCheck.gracePeriodSeconds}
                />
              </FieldAutofocus>
              <FieldError>{errors.gracePeriodSeconds}</FieldError>
            </FormGroup>
            <FormGroup
              className="column-3"
              showError={Boolean(errors.intervalSeconds)}
            >
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    <Trans render="span">Interval (s)</Trans>
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent>
                    <Tooltip
                      content={intervalHelpText}
                      interactive={true}
                      maxWidth={300}
                      wrapText={true}
                    >
                      <InfoTooltipIcon />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                name={`healthChecks.${key}.intervalSeconds`}
                type="number"
                min="0"
                placeholder="60"
                value={healthCheck.intervalSeconds}
              />
              <FieldError>{errors.intervalSeconds}</FieldError>
            </FormGroup>
            <FormGroup
              className="column-3"
              showError={Boolean(errors.timeoutSeconds)}
            >
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    <Trans render="span">Timeout (s)</Trans>
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent>
                    <Tooltip
                      content={timeoutHelpText}
                      interactive={true}
                      maxWidth={300}
                      wrapText={true}
                    >
                      <InfoTooltipIcon />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                name={`healthChecks.${key}.timeoutSeconds`}
                type="number"
                min="0"
                placeholder="20"
                value={healthCheck.timeoutSeconds}
              />
              <FieldError>{errors.timeoutSeconds}</FieldError>
            </FormGroup>
            <FormGroup
              className="column-3"
              showError={Boolean(errors.maxConsecutiveFailures)}
            >
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    <Trans render="span">Max Failures</Trans>
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent>
                    <Tooltip
                      content={failuresHelpText}
                      interactive={true}
                      maxWidth={300}
                      wrapText={true}
                    >
                      <InfoTooltipIcon />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                name={`healthChecks.${key}.maxConsecutiveFailures`}
                type="number"
                min="0"
                placeholder="3"
                value={healthCheck.maxConsecutiveFailures}
              />
              <FieldError>{errors.maxConsecutiveFailures}</FieldError>
            </FormGroup>
          </FormRow>
        </AdvancedSectionContent>
      </AdvancedSection>
    );
  }

  getCommandFields(healthCheck, key) {
    if (healthCheck.protocol !== COMMAND) {
      return null;
    }

    const errors = errorsLens
      .at(key, {})
      .attr("command", {})
      .get(this.props.errors);

    return (
      <FormRow>
        <FormGroup className="column-6" showError={Boolean(errors.value)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Command</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldTextarea
              name={`healthChecks.${key}.command`}
              type="text"
              value={healthCheck.command}
            />
          </FieldAutofocus>
          <FieldError>{errors.value}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  getEndpoints() {
    const { data } = this.props;

    return data.portDefinitions.map((port, index) => {
      return (
        <option key={index} value={index}>
          {port.name || index}
        </option>
      );
    });
  }

  getIpProtocol(data) {
    const { healthCheck, key, errors } = data;
    const runtime = findNestedPropertyInObject(
      this.props.data,
      "container.type"
    );
    // IPv6 Healthchecks is currently only supported in DOCKER runtime.
    if (runtime !== "DOCKER") {
      return null;
    }

    return (
      <FormGroup showError={false} className="column-12">
        <FieldLabel>
          <FieldInput
            checked={healthCheck.isIPv6}
            name={`healthChecks.${key}.isIPv6`}
            type="checkbox"
          />
          {"Make "}
          <Trans render="span" className="truecase">
            IPv6
          </Trans>
        </FieldLabel>
        <FieldError>{errors.ipProtocol}</FieldError>
      </FormGroup>
    );
  }

  getHTTPFields(healthCheck, key) {
    if (
      healthCheck.protocol !== MESOS_HTTP &&
      healthCheck.protocol !== MESOS_HTTPS
    ) {
      return null;
    }

    const errors = errorsLens.at(key, {}).get(this.props.errors);

    const endpointHelpText = (
      <Trans render="span">
        Select a service endpoint that you configured in Networking.
      </Trans>
    );
    const pathHelpText = (
      <Trans render="span">
        Enter a path that is reachable in your service and where you expect a
        response code between 200 and 399.
      </Trans>
    );

    return [
      <FormRow key="path">
        <FormGroup className="column-6" showError={false}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Service Endpoint</Trans>
              </FormGroupHeadingContent>
              <FormGroupHeadingContent>
                <Tooltip
                  content={endpointHelpText}
                  interactive={true}
                  maxWidth={300}
                  wrapperClassName="tooltip-wrapper tooltip-block-wrapper text-align-center"
                  wrapText={true}
                >
                  <InfoTooltipIcon />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldSelect
            name={`healthChecks.${key}.portIndex`}
            value={String(healthCheck.portIndex)}
          >
            <Trans render={<option value="" />}>Select Endpoint</Trans>
            {this.getEndpoints()}
          </FieldSelect>
        </FormGroup>
        <FormGroup className="column-6" showError={Boolean(errors.path)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Path</Trans>
              </FormGroupHeadingContent>
              <FormGroupHeadingContent>
                <Tooltip
                  content={pathHelpText}
                  interactive={true}
                  maxWidth={300}
                  wrapText={true}
                >
                  <InfoTooltipIcon />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldAutofocus>
            <FieldInput
              name={`healthChecks.${key}.path`}
              type="text"
              value={healthCheck.path}
            />
          </FieldAutofocus>
          <FieldError>{errors.path}</FieldError>
        </FormGroup>
      </FormRow>,
      <FormRow key="MESOS_HTTPS">
        <FormGroup showError={false} className="column-12">
          <FieldLabel>
            <FieldInput
              checked={healthCheck.protocol === MESOS_HTTPS}
              name={`healthChecks.${key}.https`}
              type="checkbox"
              value="HTTPS"
            />
            Make HTTPS
          </FieldLabel>
          <FieldError>{errors.protocol}</FieldError>
        </FormGroup>
      </FormRow>,
      <FormRow key="IPv6">
        {this.getIpProtocol({ healthCheck, key, errors })}
      </FormRow>
    ];
  }

  getHealthChecksLines(data) {
    return data.map((healthCheck, key) => {
      const errors = errorsLens.at(key, {}).get(this.props.errors);

      if (
        !HealthCheckUtil.isKnownProtocol(healthCheck.protocol) &&
        healthCheck.protocol != null
      ) {
        return (
          <FormGroupContainer
            key={key}
            onRemove={this.props.onRemoveItem.bind(this, {
              value: key,
              path: "healthChecks"
            })}
          >
            <FieldLabel>
              <Trans render="span">Unable to edit this HealthCheck</Trans>
            </FieldLabel>
            <pre>{JSON.stringify(healthCheck, null, 2)}</pre>
          </FormGroupContainer>
        );
      }

      const tooltipContent = (
        <Trans render="span">
          You have several protocol options.{" "}
          <a
            href={MetadataStore.buildDocsURI(
              "/deploying-services/creating-services/health-checks/"
            )}
            target="_blank"
          >
            More Information
          </a>.
        </Trans>
      );

      return (
        <FormGroupContainer
          key={key}
          onRemove={this.props.onRemoveItem.bind(this, {
            value: key,
            path: "healthChecks"
          })}
        >
          <FormRow>
            <FormGroup
              className="column-6"
              showError={Boolean(errors.protocol)}
            >
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    <Trans render="span">Protocol</Trans>
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent>
                    <Tooltip
                      content={tooltipContent}
                      interactive={true}
                      maxWidth={300}
                      wrapperClassName="tooltip-wrapper text-align-center"
                      wrapText={true}
                    >
                      <InfoTooltipIcon />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldSelect
                name={`healthChecks.${key}.protocol`}
                value={
                  healthCheck.protocol &&
                  healthCheck.protocol.replace(MESOS_HTTPS, MESOS_HTTP)
                }
              >
                <Trans render={<option value="" />}>Select Protocol</Trans>
                <Trans render={<option value={COMMAND} />}>Command</Trans>
                <Trans render={<option value={MESOS_HTTP} />}>HTTP</Trans>
              </FieldSelect>
              <FieldError>{errors.protocol}</FieldError>
            </FormGroup>
          </FormRow>
          {this.getCommandFields(healthCheck, key)}
          {this.getHTTPFields(healthCheck, key)}
          {this.getAdvancedSettings(healthCheck, key)}
        </FormGroupContainer>
      );
    });
  }

  render() {
    const { data } = this.props;
    const tooltipContent = (
      <Trans render="span">
        A health check passes if (1) its HTTP response code is between 200 and{" "}
        399 inclusive, and (2) its response is received within the{" "}
        timeoutSeconds period.{" "}
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/creating-services/health-checks/"
          )}
          target="_blank"
        >
          More Information
        </a>.
      </Trans>
    );

    return (
      <div>
        <h1 className="flush-top short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              <Trans render="span">Health Checks</Trans>
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={tooltipContent}
                interactive={true}
                maxWidth={300}
                wrapperClassName="tooltip-wrapper text-align-center"
                wrapText={true}
              >
                <InfoTooltipIcon />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h1>
        <Trans render="p">
          Health checks may be specified per application to be run against the
          application's instances.
        </Trans>
        {this.getHealthChecksLines(data.healthChecks)}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton
              onClick={this.props.onAddItem.bind(this, {
                path: "healthChecks"
              })}
            >
              <Trans render="span">Add Health Check</Trans>
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

HealthChecksFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {}
};

HealthChecksFormSection.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.object,
  onAddItem: PropTypes.func,
  onRemoveItem: PropTypes.func
};

HealthChecksFormSection.configReducers = {
  healthChecks
};

HealthChecksFormSection.validationReducers = {
  healthChecks() {
    return [];
  }
};

export default HealthChecksFormSection;

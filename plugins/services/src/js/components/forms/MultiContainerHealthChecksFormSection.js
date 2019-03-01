import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Tooltip } from "reactjs-components";
import Objektiv from "objektiv";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import {
  iconSizeXs,
  purple
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import AddButton from "#SRC/js/components/form/AddButton";
import AdvancedSection from "#SRC/js/components/form/AdvancedSection";
import AdvancedSectionContent from "#SRC/js/components/form/AdvancedSectionContent";
import AdvancedSectionLabel from "#SRC/js/components/form/AdvancedSectionLabel";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import FieldTextarea from "#SRC/js/components/form/FieldTextarea";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupContainer from "#SRC/js/components/form/FormGroupContainer";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import InfoTooltipIcon from "#SRC/js/components/form/InfoTooltipIcon";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import { HTTP, TCP, COMMAND } from "../../constants/HealthCheckProtocols";

class MultiContainerHealthChecksFormSection extends Component {
  getAdvancedSettings(healthCheck, path, errorsLens) {
    const errors = errorsLens.get(this.props.errors);

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
              <FieldInput
                name={`${path}.gracePeriodSeconds`}
                type="number"
                min="0"
                placeholder="300"
                value={healthCheck.gracePeriodSeconds}
              />
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
                name={`${path}.intervalSeconds`}
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
                name={`${path}.timeoutSeconds`}
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
                name={`${path}.maxConsecutiveFailures`}
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

  getCommandFields(healthCheck, path, errorsLens) {
    if (healthCheck.protocol !== COMMAND) {
      return null;
    }

    const { exec } = healthCheck;
    const errors = errorsLens
      .attr("exec", {})
      .attr("command", {})
      .get(this.props.errors);

    return (
      <FormRow>
        <FormGroup
          className="column-12"
          showError={Boolean(errors.shell || errors.argv)}
        >
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Command</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldTextarea
            name={`${path}.exec.command.value`}
            type="text"
            value={exec && exec.command.value}
          />
          <FieldError>{errors.shell || errors.argv}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  getEndpoints(container) {
    if (container.endpoints == null) {
      return [];
    }

    return container.endpoints.map(endpoint => {
      return (
        <option key={endpoint} value={endpoint.name}>
          {endpoint.name}
        </option>
      );
    });
  }

  getHTTPFields(healthCheck, container, path, errorsLens) {
    if (healthCheck.protocol !== HTTP) {
      return null;
    }

    const errors = errorsLens.at("http", {}).get(this.props.errors);

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
            name={`${path}.http.endpoint`}
            value={String(healthCheck.http.endpoint)}
          >
            <Trans render={<option value="" />}>Select Endpoint</Trans>
            {this.getEndpoints(container)}
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
          <FieldInput
            name={`${path}.http.path`}
            type="text"
            value={healthCheck.http.path}
          />
          <FieldError>{errors.path}</FieldError>
        </FormGroup>
      </FormRow>,
      <FormRow key="HTTPS">
        <FormGroup showError={false} className="column-12">
          <FieldLabel>
            <FieldInput
              checked={healthCheck.http.https}
              name={`${path}.http.https`}
              type="checkbox"
            />
            Make HTTPS
          </FieldLabel>
          <FieldError>{errors.protocol}</FieldError>
        </FormGroup>
      </FormRow>
    ];
  }

  getTCPFields(healthCheck, container, path) {
    if (healthCheck.protocol !== TCP) {
      return null;
    }

    return (
      <FormRow key="path">
        <FormGroup className="column-12" showError={false}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans render="span">Service Endpoint</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldSelect
            name={`${path}.tcp.endpoint`}
            value={String(healthCheck.tcp.endpoint)}
          >
            <Trans render={<option value="" />}>Select Endpoint</Trans>
            {this.getEndpoints(container)}
          </FieldSelect>
        </FormGroup>
      </FormRow>
    );
  }

  getHealthChecksBody(container, index) {
    const { healthCheck } = container;
    const path = `containers.${index}.healthCheck`;
    const errorsLens = Objektiv.attr("containers", [])
      .at(index, {})
      .attr("healthCheck", {});

    if (healthCheck == null) {
      return (
        <div>
          <AddButton onClick={this.props.onAddItem.bind(this, { path })}>
            <Trans render="span">Add Health Check</Trans>
          </AddButton>
        </div>
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
        onRemove={this.props.onRemoveItem.bind(this, { path })}
      >
        <FormRow>
          <FormGroup className="column-6">
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
            <FieldSelect name={`${path}.protocol`} value={healthCheck.protocol}>
              <Trans render={<option value="" />}>Select Protocol</Trans>
              <Trans render={<option value={COMMAND} />}>Command</Trans>
              <Trans render={<option value={HTTP} />}>HTTP</Trans>
              <Trans render={<option value={TCP} />}>TCP</Trans>
            </FieldSelect>
          </FormGroup>
        </FormRow>
        {this.getHTTPFields(healthCheck, container, path, errorsLens)}
        {this.getTCPFields(healthCheck, container, path)}
        {this.getCommandFields(healthCheck, path, errorsLens)}
        {this.getAdvancedSettings(healthCheck, path, errorsLens)}
      </FormGroupContainer>
    );
  }

  getContainerHealthChecks(containers) {
    return containers.map((container, index) => {
      return (
        <div key={container.name}>
          <div className="form-row-element">
            <h3 className="form-header short-bottom">
              <FormGroupHeading>
                <FormGroupHeadingContent>
                  <Icon
                    shape={SystemIcons.Container}
                    size={iconSizeXs}
                    color={purple}
                  />
                </FormGroupHeadingContent>
                <FormGroupHeadingContent primary={true}>
                  {container.name}
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </h3>
          </div>
          {this.getHealthChecksBody(container, index)}
        </div>
      );
    });
  }

  render() {
    const { data, handleTabChange } = this.props;
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
    const heading = (
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
            <Icon color="light-grey" id="circle-question" size="mini" />
          </Tooltip>
        </FormGroupHeadingContent>
      </FormGroupHeading>
    );

    if (!data.containers || !data.containers.length) {
      return (
        <div>
          <h1 className="flush-top short-bottom">{heading}</h1>
          <Trans render="p">
            Please{" "}
            <a
              onClick={handleTabChange.bind(null, "services")}
              className="clickable"
            >
              add a container
            </a>{" "}
            before configuring health checks.
          </Trans>
        </div>
      );
    }

    return (
      <div className="form flush-bottom">
        <h1 className="form-header flush-top short-bottom">{heading}</h1>
        <Trans render="p">
          Health checks may be specified per application to be run against the
          application{"'"}s instances.
        </Trans>
        {this.getContainerHealthChecks(data.containers)}
      </div>
    );
  }
}

MultiContainerHealthChecksFormSection.defaultProps = {
  data: {},
  errors: {},
  handleTabChange() {},
  onAddItem() {},
  onRemoveItem() {}
};

MultiContainerHealthChecksFormSection.propTypes = {
  data: PropTypes.object,
  errors: PropTypes.object,
  handleTabChange: PropTypes.func,
  onAddItem: PropTypes.func,
  onRemoveItem: PropTypes.func
};

module.exports = MultiContainerHealthChecksFormSection;

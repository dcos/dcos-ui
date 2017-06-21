import React, { Component } from "react";
import { Tooltip } from "reactjs-components";
import Objektiv from "objektiv";

import AddButton from "../../../../../../src/js/components/form/AddButton";
import AdvancedSection
  from "../../../../../../src/js/components/form/AdvancedSection";
import AdvancedSectionContent
  from "../../../../../../src/js/components/form/AdvancedSectionContent";
import AdvancedSectionLabel
  from "../../../../../../src/js/components/form/AdvancedSectionLabel";
import FieldError from "../../../../../../src/js/components/form/FieldError";
import FieldInput from "../../../../../../src/js/components/form/FieldInput";
import FieldTextarea
  from "../../../../../../src/js/components/form/FieldTextarea";
import FieldLabel from "../../../../../../src/js/components/form/FieldLabel";
import FieldSelect from "../../../../../../src/js/components/form/FieldSelect";
import FormGroup from "../../../../../../src/js/components/form/FormGroup";
import FormGroupContainer
  from "../../../../../../src/js/components/form/FormGroupContainer";
import FormGroupHeading
  from "../../../../../../src/js/components/form/FormGroupHeading";
import FormGroupHeadingContent
  from "../../../../../../src/js/components/form/FormGroupHeadingContent";
import FormRow from "../../../../../../src/js/components/form/FormRow";
import {
  MESOS_HTTP,
  MESOS_HTTPS,
  COMMAND
} from "../../constants/HealthCheckProtocols";
import HealthCheckUtil from "../../utils/HealthCheckUtil";
import Icon from "../../../../../../src/js/components/Icon";
import {
  FormReducer as healthChecks
} from "../../reducers/serviceForm/HealthChecks";

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
      <span>
        (Optional. Default: 300): Health check failures are ignored within this
        number of seconds or until the instance becomes healthy for the first
        time.
      </span>
    );

    const intervalHelpText = (
      <span>
        (Optional. Default: 60): Number of seconds to wait between health checks.
      </span>
    );

    const timeoutHelpText = (
      <span>
        (Optional. Default: 20): Number of seconds after which a health check
        is considered a failure regardless of the response.
      </span>
    );

    const failuresHelpText = (
      <span>
        (Optional. Default: 3): Number of consecutive health check failures
        after which the unhealthy instance should be killed. HTTP & TCP health
        checks: If this value is 0, instances will not be killed if they fail
        the health check.
      </span>
    );

    return (
      <AdvancedSection>
        <AdvancedSectionLabel>
          Advanced Health Check Settings
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
                    Grace Period (s)
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent>
                    <Tooltip
                      content={gracePeriodHelpText}
                      interactive={true}
                      maxWidth={300}
                      scrollContainer=".gm-scroll-view"
                      wrapText={true}
                    >
                      <Icon color="grey" id="circle-question" size="mini" />
                    </Tooltip>
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                name={`healthChecks.${key}.gracePeriodSeconds`}
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
                    Interval (s)
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent>
                    <Tooltip
                      content={intervalHelpText}
                      interactive={true}
                      maxWidth={300}
                      scrollContainer=".gm-scroll-view"
                      wrapText={true}
                    >
                      <Icon color="grey" id="circle-question" size="mini" />
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
                    Timeout (s)
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent>
                    <Tooltip
                      content={timeoutHelpText}
                      interactive={true}
                      maxWidth={300}
                      scrollContainer=".gm-scroll-view"
                      wrapText={true}
                    >
                      <Icon color="grey" id="circle-question" size="mini" />
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
                    Max Failures
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent>
                    <Tooltip
                      content={failuresHelpText}
                      interactive={true}
                      maxWidth={300}
                      scrollContainer=".gm-scroll-view"
                      wrapText={true}
                    >
                      <Icon color="grey" id="circle-question" size="mini" />
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
        <FormGroup className="column-12" showError={Boolean(errors.value)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Command
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldTextarea
            name={`healthChecks.${key}.command`}
            type="text"
            value={healthCheck.command}
          />
          <FieldError>{errors.value}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  getEndpoints() {
    const { data } = this.props;

    return data.portDefinitions.map((port, index) => {
      return <option key={index} value={index}>{port.name || index}</option>;
    });
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
      <span>Select a service endpoint that you configured in Networking.</span>
    );
    const pathHelpText = (
      <span>
        Enter a path that is reachable in your service and where you expect
        a response code between 200 and 399.
      </span>
    );

    return [
      <FormRow key="path">
        <FormGroup className="column-6" showError={false}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Service Endpoint
              </FormGroupHeadingContent>
              <FormGroupHeadingContent>
                <Tooltip
                  content={endpointHelpText}
                  interactive={true}
                  maxWidth={300}
                  scrollContainer=".gm-scroll-view"
                  wrapperClassName="tooltip-wrapper tooltip-block-wrapper text-align-center"
                  wrapText={true}
                >
                  <Icon color="grey" id="circle-question" size="mini" />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldSelect
            name={`healthChecks.${key}.portIndex`}
            value={String(healthCheck.portIndex)}
          >
            <option value="">Select Endpoint</option>
            {this.getEndpoints()}
          </FieldSelect>
        </FormGroup>
        <FormGroup className="column-6" showError={Boolean(errors.path)}>
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Path
              </FormGroupHeadingContent>
              <FormGroupHeadingContent>
                <Tooltip
                  content={pathHelpText}
                  interactive={true}
                  maxWidth={300}
                  scrollContainer=".gm-scroll-view"
                  wrapText={true}
                >
                  <Icon color="grey" id="circle-question" size="mini" />
                </Tooltip>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            name={`healthChecks.${key}.path`}
            type="text"
            value={healthCheck.path}
          />
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
              Unable to edit this HealthCheck
            </FieldLabel>
            <pre>
              {JSON.stringify(healthCheck, null, 2)}
            </pre>
          </FormGroupContainer>
        );
      }

      const tooltipContent = (
        <span>
          {"You have several protocol options. "}
          <a
            href="https://mesosphere.github.io/marathon/docs/health-checks.html"
            target="_blank"
          >
            More Information
          </a>.
        </span>
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
                    Protocol
                  </FormGroupHeadingContent>
                  <FormGroupHeadingContent>
                    <Tooltip
                      content={tooltipContent}
                      interactive={true}
                      maxWidth={300}
                      scrollContainer=".gm-scroll-view"
                      wrapperClassName="tooltip-wrapper text-align-center"
                      wrapText={true}
                    >
                      <Icon color="grey" id="circle-question" size="mini" />
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
                <option value="">Select Protocol</option>
                <option value={COMMAND}>Command</option>
                <option value={MESOS_HTTP}>HTTP</option>
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
      <span>
        {`A health check passes if (1) its HTTP response code is between 200
        and 399 inclusive, and (2) its response is received within the
        timeoutSeconds period. `}
        <a
          href="https://mesosphere.github.io/marathon/docs/health-checks.html"
          target="_blank"
        >
          More Information
        </a>.
      </span>
    );

    return (
      <div>
        <h2 className="flush-top short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Health Checks
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={tooltipContent}
                interactive={true}
                maxWidth={300}
                scrollContainer=".gm-scroll-view"
                wrapperClassName="tooltip-wrapper text-align-center"
                wrapText={true}
              >
                <Icon color="grey" id="circle-question" size="mini" />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h2>
        <p>
          Health checks may be specified per application to be run against
          the application{"'"}s instances.
        </p>
        {this.getHealthChecksLines(data.healthChecks)}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton
              onClick={this.props.onAddItem.bind(this, {
                value: data.healthChecks.length,
                path: "healthChecks"
              })}
            >
              Add Health Check
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
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

HealthChecksFormSection.configReducers = {
  healthChecks
};

HealthChecksFormSection.validationReducers = {
  healthChecks() {
    return [];
  }
};

module.exports = HealthChecksFormSection;

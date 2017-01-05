import React, {Component} from 'react';
import Objektiv from 'objektiv';

import AdvancedSection from '../../../../../../src/js/components/form/AdvancedSection';
import AdvancedSectionContent from '../../../../../../src/js/components/form/AdvancedSectionContent';
import AdvancedSectionLabel from '../../../../../../src/js/components/form/AdvancedSectionLabel';
import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldTextarea from '../../../../../../src/js/components/form/FieldTextarea';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldSelect from '../../../../../../src/js/components/form/FieldSelect';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import FormGroupContainer from '../../../../../../src/js/components/form/FormGroupContainer';
import FormRow from '../../../../../../src/js/components/form/FormRow';
import {HTTP, TCP, COMMAND} from '../../constants/HealtCheckProtocols';

class MultiContainerHealthChecksFormSection extends Component {
  getAdvancedSettings(healthCheck, path, errorsLens) {
    const errors = errorsLens.get(this.props.errors);

    return (
      <AdvancedSection>
        <AdvancedSectionLabel>
          Advanced Health Check Settings
        </AdvancedSectionLabel>
        <AdvancedSectionContent>
          <div className="flex row">
            <FormGroup
              className="column-3"
              showError={Boolean(errors.gracePeriodSeconds)}>
              <FieldLabel>Grace Period (s)</FieldLabel>
              <FieldInput
                name={`${path}.gracePeriodSeconds`}
                type="number"
                min="0"
                value={healthCheck.gracePeriodSeconds}/>
              <FieldError>{errors.gracePeriodSeconds}</FieldError>
            </FormGroup>
            <FormGroup
              className="column-3"
              showError={Boolean(errors.intervalSeconds)}>
              <FieldLabel>Interval (s)</FieldLabel>
              <FieldInput
                name={`${path}.intervalSeconds`}
                type="number"
                min="0"
                value={healthCheck.intervalSeconds}/>
              <FieldError>{errors.intervalSeconds}</FieldError>
            </FormGroup>
            <FormGroup
              className="column-3"
              showError={Boolean(errors.timeoutSeconds)}>
              <FieldLabel>Timeout (s)</FieldLabel>
              <FieldInput
                name={`${path}.timeoutSeconds`}
                type="number"
                min="0"
                value={healthCheck.timeoutSeconds}/>
              <FieldError>{errors.timeoutSeconds}</FieldError>
            </FormGroup>
            <FormGroup
              className="column-3"
              showError={Boolean(errors.maxConsecutiveFailures)}>
              <FieldLabel>Max Failures</FieldLabel>
              <FieldInput
                name={`${path}.maxConsecutiveFailures`}
                type="number"
                min="0"
                value={healthCheck.maxConsecutiveFailures}/>
              <FieldError>{errors.maxConsecutiveFailures}</FieldError>
            </FormGroup>
          </div>
        </AdvancedSectionContent>
      </AdvancedSection>
    );
  }

  getCommandFields(healthCheck, path, errorsLens) {
    if (healthCheck.protocol !== COMMAND) {
      return null;
    }

    const {exec} = healthCheck;
    const errors = errorsLens
      .attr('exec', {})
      .attr('command', {})
      .get(this.props.errors);

    return (
      <div className="flex row">
        <FormGroup
          className="column-12"
          showError={Boolean(errors.shell || errors.argv)}>
          <FieldLabel>Command</FieldLabel>
          <FieldTextarea
            name={`${path}.exec.command.string`}
            type="text"
            value={exec && exec.command.string}/>
          <FieldError>{errors.shell || errors.argv}</FieldError>
        </FormGroup>
      </div>
    );
  }

  getEndpoints(container) {
    if (container.endpoints == null) {
      return [];
    }

    return container.endpoints.map((endpoint) => {
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

    const errors = errorsLens
      .at('http', {})
      .get(this.props.errors);

    return [(
      <FormRow key="path">
        <FormGroup
          className="column-6"
          showError={false}>
          <FieldLabel>Service Endpoint</FieldLabel>
          <FieldSelect
            name={`${path}.http.endpoint`}
            value={String(healthCheck.http.endpoint)}>
            <option value="">Select Endpoint</option>
            {this.getEndpoints(container)}
          </FieldSelect>
        </FormGroup>
        <FormGroup
          className="column-6"
          showError={Boolean(errors.path)}>
          <FieldLabel>Path</FieldLabel>
          <FieldInput
            name={`${path}.http.path`}
            type="text"
            value={healthCheck.http.path}/>
          <FieldError>{errors.path}</FieldError>
        </FormGroup>
      </FormRow>
    ),
    (
      <FormRow key="HTTPS">
        <FormGroup showError={false} className="column-12">
          <FieldLabel>
            <FieldInput
              checked={healthCheck.http.https}
              name={`${path}.http.https`}
              type="checkbox" />
            Make HTTPS
          </FieldLabel>
          <FieldError>{errors.protocol}</FieldError>
        </FormGroup>
      </FormRow>
    )];
  }

  getTCPFields(healthCheck, container, path) {
    if (healthCheck.protocol !== TCP) {
      return null;
    }

    return (
      <FormRow key="path">
        <FormGroup
          className="column-12"
          showError={false}>
          <FieldLabel>Service Endpoint</FieldLabel>
          <FieldSelect
            name={`${path}.tcp.endpoint`}
            value={String(healthCheck.tcp.endpoint)}>
            <option value="">Select Endpoint</option>
            {this.getEndpoints(container)}
          </FieldSelect>
        </FormGroup>
      </FormRow>
    );
  }

  getHealthChecksBody(container, index) {
    const {healthCheck} = container;
    const path = `containers.${index}.healthCheck`;
    const errorsLens = Objektiv.attr('containers', [])
      .at(index, {})
      .attr('healthCheck', {});

    if (healthCheck == null) {
      return (
        <div>
          <a className="button button-primary-link button-flush"
            onClick={this.props.onAddItem.bind(this, {path})}>
            + Add Health Check
          </a>
        </div>
      );
    }

    return (
      <FormGroupContainer
        onRemove={this.props.onRemoveItem.bind(this, {path})}>
        <FormRow>
          <FormGroup className="column-6">
            <FieldLabel>Protocol</FieldLabel>
            <FieldSelect name={`${path}.protocol`}
              value={healthCheck.protocol}>
              <option value="">Select Protocol</option>
              <option value={COMMAND}>Command</option>
              <option value={HTTP}>HTTP</option>
              <option value={TCP}>TCP</option>
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
            <h2 className="form-header flush-top short-bottom">
              Health Checks {container.name}
            </h2>
            <p>
              Health checks may be specified per application to be run against
              the application{'\''}s tasks.
            </p>
          </div>

          {this.getHealthChecksBody(container, index)}
        </div>
      );
    });
  }

  render() {
    const {data, handleTabChange} = this.props;

    if (!data.containers || !data.containers.length) {
      return (
        <div className="form flush-bottom">
          <h2 className="form-header flush-top short-bottom">
            Health Checks
          </h2>
          <p>
            Please <a onClick={handleTabChange.bind(null, 'services')} className="clickable">add a container</a> before configuring health checks.
          </p>
        </div>
      );
    }

    return (
      <div className="form flush-bottom">
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
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  handleTabChange: React.PropTypes.func,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

module.exports = MultiContainerHealthChecksFormSection;

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
import {HTTP, HTTPS, COMMAND} from '../../constants/HealthCheckProtocols';
import HealthCheckUtil from '../../utils/HealthCheckUtil';
import Icon from '../../../../../../src/js/components/Icon';

import {FormReducer as healthChecks} from '../../reducers/serviceForm/HealthChecks';

const errorsLens = Objektiv.attr('healthChecks', []);

class HealthChecksFormSection extends Component {
  getAdvancedSettings(healthCheck, key) {
    if (healthCheck.protocol !== COMMAND && healthCheck.protocol !== HTTP &&
      healthCheck.protocol !== HTTPS) {
      return null;
    }

    const errors = errorsLens.at(key, {}).get(this.props.errors);

    return (
      <AdvancedSection>
        <AdvancedSectionLabel>
          Advanced Health Check Settings
        </AdvancedSectionLabel>
        <AdvancedSectionContent>
          <FormRow>
            <FormGroup
              className="column-3"
              showError={Boolean(errors.gracePeriodSeconds)}>
              <FieldLabel>Grace Period (s)</FieldLabel>
              <FieldInput
                name={`healthChecks.${key}.gracePeriodSeconds`}
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
                name={`healthChecks.${key}.intervalSeconds`}
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
                name={`healthChecks.${key}.timeoutSeconds`}
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
                name={`healthChecks.${key}.maxConsecutiveFailures`}
                type="number"
                min="0"
                value={healthCheck.maxConsecutiveFailures}/>
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
      .attr('command', {})
      .get(this.props.errors);

    return (
      <FormRow>
        <FormGroup
          className="column-12"
          showError={Boolean(errors.value)}>
          <FieldLabel>Command</FieldLabel>
          <FieldTextarea
            name={`healthChecks.${key}.command`}
            type="text"
            value={healthCheck.command}/>
          <FieldError>{errors.value}</FieldError>
        </FormGroup>
      </FormRow>
    );
  }

  getEndpoints() {
    const {data} = this.props;

    return data.portDefinitions.map((port, index) => {
      return (<option key={index} value={index}>{port.name || index}</option>);
    });
  }

  getHTTPFields(healthCheck, key) {
    if (healthCheck.protocol !== HTTP && healthCheck.protocol !== HTTPS) {
      return null;
    }

    const errors = errorsLens.at(key, {}).get(this.props.errors);

    return [(
      <FormRow key="path">
        <FormGroup
          className="column-6"
          showError={false}>
          <FieldLabel>Service Endpoint</FieldLabel>
          <FieldSelect
            name={`healthChecks.${key}.portIndex`}
            value={String(healthCheck.portIndex)}>
            <option value="">Select Endpoint</option>
            {this.getEndpoints()}
          </FieldSelect>
        </FormGroup>
        <FormGroup
          className="column-6"
          showError={Boolean(errors.path)}>
          <FieldLabel>Path</FieldLabel>
          <FieldInput
            name={`healthChecks.${key}.path`}
            type="text"
            value={healthCheck.path}/>
          <FieldError>{errors.path}</FieldError>
        </FormGroup>
      </FormRow>
    ),
    (
      <FormRow key="HTTPS">
        <FormGroup showError={false} className="column-12">
          <FieldLabel>
            <FieldInput
              checked={healthCheck.protocol === HTTPS}
              name={`healthChecks.${key}.https`}
              type="checkbox"
              value="HTTPS"/>
            Make HTTPS
          </FieldLabel>
          <FieldError>{errors.protocol}</FieldError>
        </FormGroup>
      </FormRow>
    )];
  }

  getHealthChecksLines(data) {
    return data.map((healthCheck, key) => {
      const errors = errorsLens.at(key, {}).get(this.props.errors);

      if (!HealthCheckUtil.isKnownProtocol(healthCheck.protocol) &&
        healthCheck.protocol != null) {
        return (
          <FormGroupContainer
            key={key}
            onRemove={this.props.onRemoveItem.bind(this,
              {value: key, path: 'healthChecks'})}>
            <FieldLabel>
              Unable to edit this HealthCheck
            </FieldLabel>
            <pre>
              {JSON.stringify(healthCheck, null, 2)}
            </pre>
          </FormGroupContainer>
        );
      }

      return (
        <FormGroupContainer
          key={key}
          onRemove={this.props.onRemoveItem.bind(this,
            {value: key, path: 'healthChecks'})}>
          <FormRow>
            <FormGroup
              className="column-6"
              showError={Boolean(errors.protocol)}>
              <FieldLabel>Protocol</FieldLabel>
              <FieldSelect name={`healthChecks.${key}.protocol`}
                value={healthCheck.protocol &&
                healthCheck.protocol.replace(HTTPS, HTTP)}>
                <option value="">Select Protocol</option>
                <option value={COMMAND}>Command</option>
                <option value={HTTP}>HTTP</option>
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
    const {data} = this.props;

    return (
      <div>
        <h2 className="form-header flush-top short-bottom">
          Health Checks
        </h2>
        <p>
          Health checks may be specified per application to be run against
          the application{'\''}s tasks.
        </p>
        {this.getHealthChecksLines(data.healthChecks)}
        <FormRow>
          <FormGroup className="column-12">
            <a className="button button-primary-link button-flush"
              onClick={this.props.onAddItem.bind(this, {value: data.healthChecks.length, path: 'healthChecks'})}>
              <Icon color="purple" id="plus" size="tiny" /> Add Health Check
            </a>
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

import React, {Component} from 'react';

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

import {FormReducer as healthChecks} from '../../reducers/serviceForm/HealthChecks';

class HealthChecksFormSection extends Component {
  getAdvancedSettings(healthCheck, key) {
    const {healthChecks} = this.props.errors;
    if (healthCheck.protocol !== 'COMMAND' && healthCheck.protocol !== 'HTTP' &&
      healthCheck.protocol !== 'HTTPS') {
      return null;
    }

    return (
        <AdvancedSection>
          <AdvancedSectionLabel>
            Advanced Container Settings
          </AdvancedSectionLabel>
          <AdvancedSectionContent>
            <div className="flex row">
              <FormGroup
                  className="column-3"
                  showError={Boolean(healthChecks[key])}>
                <FieldLabel>Grace Period (s)</FieldLabel>
                <FieldInput
                    name={`healthChecks.${key}.gracePeriodSeconds`}
                    type="number"
                    min="0"
                    value={healthCheck.gracePeriodSeconds}/>
                <FieldError>{healthChecks[key]}</FieldError>
              </FormGroup>
              <FormGroup
                  className="column-3"
                  showError={Boolean(healthChecks[key])}>
                <FieldLabel>Interval (s)</FieldLabel>
                <FieldInput
                    name={`healthChecks.${key}.intervalSeconds`}
                    type="number"
                    min="0"
                    value={healthCheck.intervalSeconds}/>
                <FieldError>{healthChecks[key]}</FieldError>
              </FormGroup>
              <FormGroup
                  className="column-3"
                  showError={Boolean(healthChecks[key])}>
                <FieldLabel>Timeout (s)</FieldLabel>
                <FieldInput
                    name={`healthChecks.${key}.timeoutSeconds`}
                    type="number"
                    min="0"
                    value={healthCheck.timeoutSeconds}/>
                <FieldError>{healthChecks[key]}</FieldError>
              </FormGroup>
              <FormGroup
                  className="column-3"
                  showError={Boolean(healthChecks[key])}>
                <FieldLabel>Max Failures</FieldLabel>
                <FieldInput
                    name={`healthChecks.${key}.maxConsecutiveFailures`}
                    type="number"
                    min="0"
                    value={healthCheck.maxConsecutiveFailures}/>
                <FieldError>{healthChecks[key]}</FieldError>
              </FormGroup>
            </div>
          </AdvancedSectionContent>
        </AdvancedSection>
    );
  }

  getCommandFields(healthCheck, key) {
    const {healthChecks} = this.props.errors;

    if (healthCheck.protocol !== 'COMMAND') {
      return null;
    }

    return (
      <div className="flex row">
        <FormGroup
          className="column-12"
          showError={Boolean(healthChecks[key])}>
          <FieldLabel>Command</FieldLabel>
          <FieldTextarea
            name={`healthChecks.${key}.command`}
            type="text"
            value={healthCheck.command}/>
          <FieldError>{healthChecks[key]}</FieldError>
        </FormGroup>
      </div>
    );
  }

  getHTTPFields(healthCheck, key) {
    const {healthChecks} = this.props.errors;

    if (healthCheck.protocol !== 'HTTP' && healthCheck.protocol !== 'HTTPS') {
      return null;
    }

    return [(
      <div className="flex row" key="path">
        <FormGroup
          className="column-6"
          showError={false}>
          <FieldLabel>Service Endpoint</FieldLabel>
          <FieldSelect name={`healthChecks.${key}.portIndex`}>
            <option value="">Select Endpoint</option>
          </FieldSelect>
        </FormGroup>
        <FormGroup
          className="column-6"
          showError={Boolean(healthChecks[key])}>
          <FieldLabel>Path</FieldLabel>
          <FieldInput
            name={`healthChecks.${key}.path`}
            type="text"
            value={healthCheck.path}/>
          <FieldError>{healthChecks[key]}</FieldError>
        </FormGroup>
      </div>
    ),
    (
      <div className="row flex" key="HTTPS">
        <FormGroup showError={false} className="column-12">
          <FieldLabel>
            <FieldInput
              checked={healthCheck.protocol === 'HTTPS'}
              name={`healthChecks.${key}.https`}
              type="checkbox"
              value="HTTPS"/>
            Make HTTPS
          </FieldLabel>
          <FieldError>{healthChecks[key]}</FieldError>
        </FormGroup>
      </div>
    )];
  }

  getHealthChecksLines(data) {
    const {healthChecks} = this.props.errors;

    return data.map((healthCheck, key) => {
      return (
        <FormGroupContainer key={key}
          onRemove={this.props.onRemoveItem.bind(this,
            {value: key, path: 'healthChecks'})}>
          <div className="flex row">
            <FormGroup
              className="column-6"
              showError={Boolean(healthChecks[key])}>
              <FieldLabel>Protocol</FieldLabel>
              <FieldSelect name={`healthChecks.${key}.protocol`}
                value={healthCheck.protocol &&
                healthCheck.protocol.replace('HTTPS', 'HTTP')}>
                <option value="">Select Protocol</option>
                <option value="COMMAND">Command</option>
                <option value="HTTP">HTTP</option>
              </FieldSelect>
              <FieldError>{healthChecks[key]}</FieldError>
            </FormGroup>
          </div>
          {this.getCommandFields(healthCheck, key)}
          {this.getHTTPFields(healthCheck, key)}
          {this.getAdvancedSettings(healthCheck, key)}
        </FormGroupContainer>
      );
    });
  }

  render() {
    let {data} = this.props;

    return (
      <div className="form flush-bottom">
        <div className="form-row-element">
          <h2 className="form-header flush-top short-bottom">
            Health Checks
          </h2>
          <p>
            Health checks may be specified per application to be run against
            the application{'\''}s tasks.
          </p>
        </div>
        {this.getHealthChecksLines(data.healthChecks)}
        <div>
          <a className="button button-primary-link button-flush"
            onClick={this.props.onAddItem.bind(this, {value: data.healthChecks.length, path: 'healthChecks'})}>
            + Add Health Check
          </a>
        </div>
      </div>
    );
  }
}

HealthChecksFormSection.defaultProps = {
  data: {},
  errors: {
    healthChecks: []
  },
  onAddItem() {
  },
  onRemoveItem() {
  }
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

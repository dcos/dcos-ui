import React, {Component} from 'react';
import Objektiv from 'objektiv';

import AdvancedSection from '../../../../../../src/js/components/form/AdvancedSection';
import AdvancedSectionContent from '../../../../../../src/js/components/form/AdvancedSectionContent';
import AdvancedSectionLabel from '../../../../../../src/js/components/form/AdvancedSectionLabel';
import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldTextarea from '../../../../../../src/js/components/form/FieldTextarea';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import FormGroupContainer from '../../../../../../src/js/components/form/FormGroupContainer';

class MultiContainerHealthChecksFormSection extends Component {
  getAdvancedSettings(healthCheck, key, path, errorsLens) {
    const errors = errorsLens.at(key, {}).get(this.props.errors);

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
                name={`${path}.healthChecks.${key}.gracePeriodSeconds`}
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
                name={`${path}.healthChecks.${key}.intervalSeconds`}
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
                name={`${path}.healthChecks.${key}.timeoutSeconds`}
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
                name={`${path}.healthChecks.${key}.maxConsecutiveFailures`}
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

  getCommandFields(healthCheck, key, path, errorsLens) {
    const errors = errorsLens
      .at(key, {})
      .attr('command', {})
      .get(this.props.errors);

    return (
      <div className="flex row">
        <FormGroup
          className="column-12"
          showError={Boolean(errors.command)}>
          <FieldLabel>Command</FieldLabel>
          <FieldTextarea
            name={`${path}.healthChecks.${key}.command`}
            type="text"
            value={healthCheck.command && healthCheck.command.command}/>
          <FieldError>{errors.command}</FieldError>
        </FormGroup>
      </div>
    );
  }

  getEndpoints() {
    const {data} = this.props;

    return data.portDefinitions.map((port, index) => {
      return <option value={index}>{port.name || index}</option>;
    });
  }

  getHealthChecksLines(data, pathPrefix, errorsLens) {
    return data.map((healthCheck, key) => {
      return (
        <FormGroupContainer key={key}
          onRemove={this.props.onRemoveItem.bind(this,
            {value: key, path: `${pathPrefix}.healthChecks`})}>
          {this.getCommandFields(healthCheck, key, pathPrefix, errorsLens)}
          {this.getAdvancedSettings(healthCheck, key, pathPrefix, errorsLens)}
        </FormGroupContainer>
      );
    });
  }

  getContainerHealthChecks(containers) {
    return containers.map((container, index) => {
      const errorsLens = Objektiv.attr('containers', [])
        .at(index, {})
        .attr('healthChecks', []);

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
          {this.getHealthChecksLines(container.healthChecks || [], `containers.${index}`, errorsLens)}

          <div>
            <a className="button button-primary-link button-flush"
              onClick={this.props.onAddItem.bind(this, {value: index, path: `containers.${index}.healthChecks`})}>
              + Add Health Check
            </a>
          </div>
        </div>
      );
    });
  }

  render() {
    const {data} = this.props;

    return (
      <div className="form flush-bottom" >
        {this.getContainerHealthChecks(data.containers)}
      </div>
    );
  }
}

MultiContainerHealthChecksFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {}
};

MultiContainerHealthChecksFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

module.exports = MultiContainerHealthChecksFormSection;

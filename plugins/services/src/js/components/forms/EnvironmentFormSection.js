import React, {Component} from 'react';

import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import ReducerUtil from '../../../../../../src/js/utils/ReducerUtil';
import {FormReducer as env} from '../../reducers/form/EnvironmentVariables';
import {FormReducer as labels} from '../../reducers/form/Labels';

class EnvironmentFormSection extends Component {
  constructor() {
    super(...arguments);

    let reducers = ReducerUtil.combineReducers(EnvironmentFormSection.configReducers);

    this.state = {reducers};
  }

  getEnvironmentLines(data) {
    const {errors} = this.props;

    return data.map((env, key) => {
      let keyLabel = null;
      let valueLabel = null;
      if (key === 0) {
        keyLabel = (
          <FieldLabel>
            Key
          </FieldLabel>
        );
        valueLabel = (
          <FieldLabel>
            Value
          </FieldLabel>
        );
      }
      return (
        <div key={key} className="flex row">
          <FormGroup
            className="column-3"
            required={false}
            showError={Boolean(errors.env[key])}>
            {keyLabel}
            <FieldInput
              name={`env.${key}.key`}
              type="text"
              value={env.key}/>
            <FieldError>{errors.env[key]}</FieldError>
            <span className="emphasis"
              style={{
                position: 'absolute',
                left: '100%',
                bottom: '0.8em'
              }}>:</span>
          </FormGroup>
          <FormGroup
            className="column-3"
            required={false}
            showError={Boolean(errors.env[key])}>
            {valueLabel}
            <FieldInput
              name={`env.${key}.value`}
              type="text"
              value={env.value}/>
            <FieldError>{errors.env[key]}</FieldError>
          </FormGroup>
          <div className="form-group flex flex-item-align-end column-4">
            <a className="column-3 button button-primary-link button-flush"
              onClick={(event) => {
                event.preventDefault();
                this.props.onRemoveItem({value: key, path: 'env'});
              }}>
              Delete
            </a>
          </div>
        </div>
    ); });
  }

  getLabelsLines(data) {
    const {errors} = this.props;
    return data.map((label, key) => {
      let keyLabel = null;
      let valueLabel = null;
      if (key === 0) {
        keyLabel = (
          <FieldLabel>
            Key
          </FieldLabel>
        );
        valueLabel = (
          <FieldLabel>
            Value
          </FieldLabel>
        );
      }
      return (
        <div key={key} className="flex row">
          <FormGroup
            className="column-3"
            required={false}
            showError={Boolean(errors.labels[key])}>
            {keyLabel}
            <FieldInput
              name={`labels.${key}.key`}
              type="text"
              value={label.key}/>
            <span className="emphasis"
              style={{
                position: 'absolute',
                left: '100%',
                bottom: '0.8em'
              }}>:</span>
            <FieldError>{errors.labels[key]}</FieldError>
          </FormGroup>
          <FormGroup
            className="column-3"
            required={false}
            showError={Boolean(errors.labels[key])}>
            {valueLabel}
            <FieldInput
              name={`labels.${key}.value`}
              type="text"
              value={label.value}/>
            <FieldError>{errors.labels[key]}</FieldError>
          </FormGroup>
          <div className="form-group flex flex-item-align-end column-4">
            <a className="column-3 button button-primary-link button-flush"
              onClick={(event) => {
                event.preventDefault();
                this.props.onRemoveItem({value: key, path: 'labels'});
              }}>
              Delete
            </a>
          </div>
        </div>
      );
    });
  }

  render() {
    let {data} = this.props;

    return (
      <div className="form flush-bottom">
        <div className="form-row-element">
          <h2 className="form-header flush-top short-bottom">
            Environment Variables
          </h2>
          <p>
            Set up environment variables for each task your service launches.
          </p>
        </div>
        {this.getEnvironmentLines(data.env)}
        <div>
          <a className="button button-primary-link button-flush"
            onClick={(event) => {
              event.preventDefault();
              this.props.onAddItem({value: data.env.length, path: 'env'});
            }}>
            + Add Environment Variable
          </a>
        </div>
        <div className="form-row-element">
          <h2 className="form-header short-bottom">
            Labels
          </h2>
          <p>
            Attach metadata to expose additional information to other services.
          </p>
        </div>
        {this.getLabelsLines(data.labels)}
        <div>
          <a
            className="button button-primary-link button-flush"
            onClick={(event) => {
              event.preventDefault();
              this.props.onAddItem({value: data.env.length, path: 'labels'});
            }}>
            + Add Label
          </a>
        </div>
      </div>
    );
  }
}

EnvironmentFormSection.defaultProps = {
  data: {},
  errors: {
    env: [],
    labels: []
  },
  onAddItem() {},
  onRemoveItem() {}
};

EnvironmentFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

EnvironmentFormSection.configReducers = {
  env,
  labels
};

EnvironmentFormSection.validationReducers = {
  labels() {
    return [];
  },
  env() {
    return [];
  }
};

module.exports = EnvironmentFormSection;

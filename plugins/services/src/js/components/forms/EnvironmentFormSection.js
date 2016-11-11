import React, {Component} from 'react';

import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import {FormReducer as env} from '../../reducers/serviceForm/EnvironmentVariables';
import {FormReducer as labels} from '../../reducers/serviceForm/Labels';

class EnvironmentFormSection extends Component {

  getEnvironmentLines(data) {
    const {errors} = this.props;

    return data.map((env, key) => {
      let keyLabel = null;
      let valueLabel = null;
      if (key === 0) {
        keyLabel = <FieldLabel>Key</FieldLabel>;
        valueLabel = <FieldLabel>Value</FieldLabel>;
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
            <span className="emphasis form-colon">:</span>
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
          <FormGroup className="flex flex-item-align-end column-2">
            <a
              className="button button-primary-link button-flush"
              onClick={this.props.onRemoveItem.bind(this, {value: key, path: 'env'})}>
              Delete
            </a>
          </FormGroup>
        </div>
    ); });
  }

  getLabelsLines(data) {
    const {errors} = this.props;

    return data.map((label, key) => {
      let keyLabel = null;
      let valueLabel = null;
      if (key === 0) {
        keyLabel = <FieldLabel>Key</FieldLabel>;
        valueLabel = <FieldLabel>Value</FieldLabel>;
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
            <span className="emphasis form-colon">:</span>
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
          <FormGroup className="flex flex-item-align-end column-2">
            <a
              className="button button-primary-link button-flush"
              onClick={this.props.onRemoveItem.bind(this, {value: key, path: 'labels'})}>
              Delete
            </a>
          </FormGroup>
        </div>
      );
    });
  }

  render() {
    let {data} = this.props;

    return (
      <div className="form flush-bottom">
        <h2 className="flush-top short-bottom">
          Environment Variables
        </h2>
        <p>
          Set up environment variables for each task your service launches.
        </p>
        {this.getEnvironmentLines(data.env)}
        <div>
          <a
            className="button button-primary-link button-flush"
            onClick={this.props.onAddItem.bind(this, {value: data.env.length, path: 'env'})}>
            + Add Environment Variable
          </a>
        </div>
        <h2 className="short-bottom">
          Labels
        </h2>
        <p>
          Attach metadata to expose additional information to other services.
        </p>
        {this.getLabelsLines(data.labels)}
        <div>
          <a
            className="button button-primary-link button-flush"
            onClick={this.props.onAddItem.bind(this, {value: data.labels.length, path: 'labels'})}>
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

module.exports = EnvironmentFormSection;

import React, {Component} from 'react';

import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import TransactionTypes from '../../../../../../src/js/constants/TransactionTypes';
import ReducerUtil from '../../../../../../src/js/utils/ReducerUtil';
import Util from '../../../../../../src/js/utils/Util';

class EnvironmentFormSection extends Component {
  constructor() {
    super(...arguments);

    let reducers = ReducerUtil.combineReducers(EnvironmentFormSection.configReducers);

    this.state = {reducers};
  }

  getEnvironmentLines(data) {
    const {errors} = this.props;

    return data.map((env, key) => {
      return (
      <div key={key} className="flex row">
        <FormGroup
            className="column-5"
            required={false}
            showError={Boolean(errors.env[key])}>
          <FieldLabel>
            Key
          </FieldLabel>
          <FieldInput
              name={`env.${key}.key`}
              type="text"
              value={env.key}/>
          <FieldError>{errors.env[key]}</FieldError>
        </FormGroup>
        <FormGroup
            className="column-6"
            required={false}
            showError={Boolean(errors.env[key])}>
          <FieldLabel>
            Value
          </FieldLabel>
          <FieldInput
              name={`env.${key}.value`}
              type="text"
              value={env.value}/>
          <FieldError>{errors.env[key]}</FieldError>
        </FormGroup>
        <a className="column-1" onClick={(event) => { event.preventDefault(); this.props.onRemoveRow({value: key, path:'env'}); }}>
          Delete
        </a>
      </div>
    ); });
  }

  getLabelsLines(data) {
    const {errors} = this.props;
    return data.map((label, key) => {
      return (
        <div key={key} className="flex row">
          <FormGroup
              className="column-5"
              required={false}
              showError={Boolean(errors.labels[key])}>
            <FieldLabel>
              Key
            </FieldLabel>
            <FieldInput
                name={`labels.${key}.key`}
                type="text"
                value={label.key}/>
            <FieldError>{errors.labels[key]}</FieldError>
          </FormGroup>
          <FormGroup
              className="column-6"
              required={false}
              showError={Boolean(errors.labels[key])}>
            <FieldLabel>
              Value
            </FieldLabel>
            <FieldInput
                name={`labels.${key}.value`}
                type="text"
                value={label.value}/>
            <FieldError>{errors.labels[key]}</FieldError>
          </FormGroup>
          <a className="column-1" onClick={(event) => {
            event.preventDefault();
            this.props.onRemoveRow({value: key, path: 'labels'});
          }}>
            Delete
          </a>
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
          <p className="flush-bottom">
            Set up environment variables for each task your service launches.
          </p>
        </div>
        {this.getEnvironmentLines(data.env)}
        <div>
          <a onClick={(event) => {
            event.preventDefault();
            this.props.onAddRow({value: data.env.length, path: 'env'});
          }}>
            + Add Environment Variable
          </a>
        </div>
        <div className="form-row-element">
          <h2 className="form-header flush-top short-bottom">
            Labels
          </h2>
          <p className="flush-bottom">
            Attach metadata to expose additional information to other services.
          </p>
        </div>
        {this.getLabelsLines(data.labels)}
        <div>
          <a onClick={(event) => {
            event.preventDefault();
            this.props.onAddRow({value: data.env.length, path: 'labels'});
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
  onAddRow() {},
  onRemoveRow() {}
};

EnvironmentFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddRow: React.PropTypes.func,
  onRemoveRow: React.PropTypes.func
};

EnvironmentFormSection.configReducers = {
  env(state = [], {type, path, value}) {
    // Prepare
    // TODO: Remove when we use the parsers
    if (Util.isObject(state) && !Array.isArray(state)) {
      state = Object.keys(state).reduce((memo, key) => {
        memo.push({
          key,
          value: state[key]
        });
        return memo;
      }, []);
    }

    // ROWS
    if (path != null && path.join('.').search('env') !== -1) {
      if (path.join('.') === 'env') {
        switch (type) {
          case TransactionTypes.ADD_ROW:
            state.push({key: null, value: null});
            break;
          case TransactionTypes.REMOVE_ROW:
            state = state.filter((item, index) => {
              return index !== value;
            });
            break;
        }
        return state;
      }

      // SET
      let joinedPath = path.join('.');
      let index = joinedPath.match(/\d+/)[0];
      switch (true) {
        case (type === TransactionTypes.SET &&
        `env.${index}.key` === joinedPath):
          state[index].key = value;
          break;
        case (type === TransactionTypes.SET &&
        `env.${index}.value` === joinedPath):
          state[index].value = value;
          break;
      }
    }
    return state;
  },
  labels(state = [], {type, path, value}) {
    // Prepare
    // TODO: Remove when we use the parsers
    if (Util.isObject(state) && !Array.isArray(state)) {
      state = Object.keys(state).reduce((memo, key) => {
        memo.push({
          key,
          value: state[key]
        });
        return memo;
      }, []);
    }

    // ROWS
    if (path != null && path.join('.').search('labels') !== -1) {
      if (path.join('.') === 'labels') {
        switch (type) {
          case TransactionTypes.ADD_ROW:
            state.push({key: null, value: null});
            break;
          case TransactionTypes.REMOVE_ROW:
            state = state.filter((item, index) => {
              return index !== value;
            });
            break;
        }
        return state;
      }

      // SET
      let joinedPath = path.join('.');
      let index = joinedPath.match(/\d+/)[0];
      switch (true) {
        case (type === TransactionTypes.SET &&
        `labels.${index}.key` === joinedPath):
          state[index].key = value;
          break;
        case (type === TransactionTypes.SET &&
        `labels.${index}.value` === joinedPath):
          state[index].value = value;
          break;
      }
    }
    return state;
  }
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

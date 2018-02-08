import PropTypes from "prop-types";
import React, { Component } from "react";
import Batch from "#SRC/js/structs/Batch";

import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldError from "#SRC/js/components/form/FieldError";
import PlacementConstraintsPartial
  from "#SRC/js/components/PlacementConstraintsPartial";
import BatchContainer from "#SRC/js/components/BatchContainer";
import DataValidatorUtil from "#SRC/js/utils/DataValidatorUtil";
import {
  JSONReducer,
  JSONParser
} from "#PLUGINS/services/src/js/reducers/serviceForm/JSONReducers/Constraints";
import { combineReducers } from "#SRC/js/utils/ReducerUtil";
import {
  FormReducer
} from "#PLUGINS/services/src/js/reducers/serviceForm/FormReducers/Constraints";
import CreateServiceModalFormUtil
  from "#PLUGINS/services/src/js/utils/CreateServiceModalFormUtil";
import MarathonAppValidators
  from "#PLUGINS/services/src/js/validators/MarathonAppValidators";

import PlacementValidators
  from "#PLUGINS/services/src/js/validators/PlacementsValidators";

const jsonReducer = combineReducers({ constraints: JSONReducer });

const JsonField = props => (
  <div>
    <FieldLabel>
      {props.label}
    </FieldLabel>
    <pre>
      {JSON.stringify(props.json, props.replacer, props.space)}
    </pre>
    <FieldError>Unable to edit {props.fieldName}</FieldError>
  </div>
);

JsonField.propTypes = {
  fieldName: React.PropTypes.string.isRequired,
  label: React.PropTypes.string.isRequired,
  json: React.PropTypes.object.isRequired,
  replacer: React.PropTypes.func,
  space: React.PropTypes.number
};

JsonField.defaultProps = {
  space: 2
};

export default class PlacementConstraintsSchemaField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      batch: new Batch()
    };
    this.state.batch = this.generateBatchFromInput();

    this.handleBatchChange = this.handleBatchChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fieldProps.formData !== this.props.fieldProps.formData) {
      this.setState({
        batch: this.generateBatchFromInput(nextProps)
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsChanged =
      nextProps.fieldProps.formData !== this.props.fieldProps.formData;
    const stateChanged = nextState.batch !== this.state.batch;

    return propsChanged || stateChanged;
  }

  generateBatchFromInput(props = this.props) {
    const { formData } = props.fieldProps;

    let json;
    try {
      json = JSON.parse(formData);
    } catch (error) {
      return this.state.batch || new Batch();
    }

    const parsedInput = CreateServiceModalFormUtil.stripEmptyProperties(json);

    return JSONParser({ constraints: parsedInput }).reduce((batch, item) => {
      return batch.add(item);
    }, new Batch());
  }

  handleBatchChange(batch) {
    const { formData, onChange } = this.props.fieldProps;
    const newJson = batch.reduce(jsonReducer, []);
    const newData = JSON.stringify(newJson.constraints);

    if (newData !== formData) {
      onChange(newData);
    } else {
      this.setState({ batch });
    }
  }

  render() {
    const { label, errorMessage } = this.props;
    const { batch } = this.state;

    const appendToList = (memo, transaction) => memo.concat(transaction);
    const hasBatchErrors = !PlacementValidators.validateNoBatchError(
      batch.reduce(appendToList, [])
    );

    if (hasBatchErrors) {
      const fieldName = this.props.fieldProps.name;
      const fieldValue = this.props.fieldProps.formData;
      const json = { [fieldName]: fieldValue };

      return <JsonField label={label} fieldName={fieldName} json={json} />;
    }
    const data = { constraints: batch.reduce(FormReducer) };
    const errors = DataValidatorUtil.errorArrayToMap(
      MarathonAppValidators.validateConstraints(
        batch.reduce(combineReducers({ constraints: JSONReducer }))
      )
    );

    return (
      <div>
        <FieldLabel>
          {label}
        </FieldLabel>
        <BatchContainer batch={batch} onChange={this.handleBatchChange}>
          <PlacementConstraintsPartial errors={errors} data={data} />
        </BatchContainer>
        <FieldError>{errorMessage}</FieldError>
      </div>
    );
  }
}

PlacementConstraintsSchemaField.defaultProps = {
  onChange() {}
};

PlacementConstraintsSchemaField.propTypes = {
  label: PropTypes.string.isRequired,
  fieldProps: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  errorMessage: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  autofocus: PropTypes.boolean,
  onChange: PropTypes.func
};

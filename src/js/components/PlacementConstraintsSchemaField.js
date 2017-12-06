import React, { Component } from "react";
import Batch from "#SRC/js/structs/Batch";

import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldError from "#SRC/js/components/form/FieldError";
import PlacementConstraintsPartial
  from "#SRC/js/components/PlacementConstraintsPartial";
import BatchContainer from "#SRC/js/components/BatchContainer";
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

const jsonReducer = combineReducers({ constraints: JSONReducer });

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
      json = JSON.parse(formData.replace(/\\"/g, '"'));
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
    const newData = JSON.stringify(newJson.constraints).replace(/"/g, '\\"');

    if (newData !== formData) {
      onChange(newData);
    } else {
      this.setState({ batch });
    }
  }

  render() {
    const { label, errorMessage } = this.props;
    const { batch } = this.state;

    const data = { constraints: batch.reduce(FormReducer) };

    return (
      <div>
        <FieldLabel>
          {label}
        </FieldLabel>
        <BatchContainer batch={batch} onChange={this.handleBatchChange}>
          <PlacementConstraintsPartial data={data} />
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
  label: React.PropTypes.string.isRequired,
  fieldProps: React.PropTypes.object.isRequired,
  schema: React.PropTypes.object.isRequired,
  errorMessage: React.PropTypes.oneOfType([
    React.PropTypes.arrayOf(React.PropTypes.node),
    React.PropTypes.node
  ]),
  autofocus: React.PropTypes.boolean,
  onChange: React.PropTypes.func
};

import React, { Component } from "react";
import Batch from "#SRC/js/structs/Batch";
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

export default class PlacementConstraintsFrameworkAdapter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      batch: this.generateBatchFromInput()
    };

    this.handleBatchChange = this.handleBatchChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({
        batch: this.generateBatchFromInput(nextProps)
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsChanged = nextProps.data !== this.props.data;
    const stateChanged = nextState.batch !== this.state.batch;

    return propsChanged || stateChanged;
  }

  generateBatchFromInput(props = this.props) {
    const { data } = props;

    let json;
    try {
      json = JSON.parse(data);
    } catch (error) {
      return this.state.batch || new Batch();
    }

    const parsedInput = CreateServiceModalFormUtil.stripEmptyProperties(json);

    return JSONParser({ constraints: parsedInput }).reduce((batch, item) => {
      return batch.add(item);
    }, new Batch());
  }

  handleBatchChange(batch) {
    const { data } = this.props;
    const newJson = batch.reduce(jsonReducer, []);
    const newData = JSON.stringify(newJson.constraints);

    if (newData !== data) {
      this.props.onChange(newData);
    } else {
      this.setState({ batch });
    }
  }

  render() {
    const { batch } = this.state;
    const data = { constraints: batch.reduce(FormReducer) };

    // TODO what to do about errors
    return (
      <BatchContainer batch={batch} onChange={this.handleBatchChange}>
        <PlacementConstraintsPartial data={data} />
      </BatchContainer>
    );
  }
}

PlacementConstraintsFrameworkAdapter.defaultProps = {
  onChange() {}
};

PlacementConstraintsFrameworkAdapter.propTypes = {
  onChange: React.PropTypes.func,
  data: React.PropTypes.string
};

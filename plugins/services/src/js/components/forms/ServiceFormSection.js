import React, {Component} from 'react';

import Batch from '../../../../../../src/js/structs/Batch';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldTextarea from '../../../../../../src/js/components/form/FieldTextarea';
import ReducerUtil from '../../../../../../src/js/utils/ReducerUtil';
import TabView from '../../../../../../src/js/components/TabView';

class ServiceFormSection extends Component {
  constructor() {
    super(...arguments);

    let reducers = ReducerUtil.combineReducers({
      id: ReducerUtil.simpleReducer('id', '/'),
      cpus: ReducerUtil.simpleReducer('cpus', 0.01),
      mem: ReducerUtil.simpleReducer('mem', 128),
      disk: ReducerUtil.simpleReducer('disk', 0),
      instances: ReducerUtil.simpleReducer('instances', 1),
      cmd: ReducerUtil.simpleReducer('cmd', '')
    });

    this.state = {reducers};
  }
  render() {
    let {batch, data} = this.props;
    let reducedData = batch.reduce(this.state.reducers, data);

    return (
      <TabView id="services">
        <div className="form flush-bottom">
          <div className="form-row-element">
            <h2 className="form-header flush-top short-bottom">
              Services
            </h2>
            <p className="flush-bottom">
              Configure your service below. Start by giving your service a name.
            </p>
          </div>

          <div className="flex row">
            <div className="column-8">
              <FieldInput
                helpBlock="Give your service a unique name, e.g. my-service."
                label="SERVICE NAME *"
                name="id"
                type="text"
                value={reducedData.id} />
            </div>

            <div className="column-4">
              <FieldInput
                label="INSTANCES"
                name="instances"
                type="number"
                value={reducedData.instances} />
            </div>
          </div>

          <div className="flex row">
            <div className="column-4">
              <FieldInput
                label="CPUs *"
                name="cpus"
                type="number"
                step="0.01"
                value={reducedData.cpus} />
            </div>
            <div className="column-4">
              <FieldInput
                label="MEMORY (MiB) *"
                name="mem"
                type="number"
                value={reducedData.mem} />
            </div>
            <div className="column-4">
              <FieldInput
                label="DISK (MiB)"
                name="disk"
                type="number"
                value={reducedData.disk} />
            </div>
          </div>

          <FieldTextarea
            label="Command"
            name="cmd"
            value={reducedData.cmd} />
        </div>
      </TabView>
    );
  }
}

ServiceFormSection.defaultProps = {
  data: {}
};

ServiceFormSection.propTypes = {
  batch: React.PropTypes.instanceOf(Batch).isRequired,
  data: React.PropTypes.object
};

module.exports = ServiceFormSection;

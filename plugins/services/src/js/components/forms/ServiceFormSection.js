import React, {Component} from 'react';

import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldTextarea from '../../../../../../src/js/components/form/FieldTextarea';
import ServiceConfigReducers from '../../reducers/ServiceConfigReducers';
import ServiceValidationReducers from '../../reducers/ServiceValidationReducers';
import TabView from '../../../../../../src/js/components/TabView';

class ServiceFormSection extends Component {
  render() {
    let {data, errors} = this.props;

    return (
      <TabView id="services">
        <div className="form flush-bottom">
          <div className="form-row-element">
            <h2 className="form-header flush-top short-bottom">
              Services
            </h2>
            <p>
              Configure your service below. Start by giving your service a name.
            </p>
          </div>

          <div className="flex row">
            <div className="column-8">
              <FieldInput
                error={errors.id}
                helpBlock="Give your service a unique name, e.g. my-service."
                label="SERVICE NAME *"
                name="id"
                type="text"
                value={data.id} />
            </div>

            <div className="column-4">
              <FieldInput
                error={errors.instances}
                label="INSTANCES"
                name="instances"
                type="number"
                value={data.instances} />
            </div>
          </div>

          <div className="flex row">
            <div className="column-4">
              <FieldInput
                error={errors.cpus}
                label="CPUs *"
                name="cpus"
                type="number"
                step="0.01"
                value={data.cpus} />
            </div>
            <div className="column-4">
              <FieldInput
                error={errors.mem}
                label="MEMORY (MiB) *"
                name="mem"
                type="number"
                value={data.mem} />
            </div>
            <div className="column-4">
              <FieldInput
                error={errors.disk}
                label="DISK (MiB)"
                name="disk"
                type="number"
                value={data.disk} />
            </div>
          </div>

          <FieldTextarea
            error={errors.cmd}
            label="Command"
            name="cmd"
            value={data.cmd} />
        </div>
      </TabView>
    );
  }
}

ServiceFormSection.defaultProps = {
  data: {},
  errors: {}
};

ServiceFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object
};

ServiceFormSection.configReducers = ServiceConfigReducers;

ServiceFormSection.validationReducers = ServiceValidationReducers;

module.exports = ServiceFormSection;

import React, {Component} from 'react';
import {Tooltip} from 'reactjs-components';

import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldTextarea from '../../../../../../src/js/components/form/FieldTextarea';
import Icon from '../../../../../../src/js/components/Icon';
import ServiceConfigReducers from '../../reducers/ServiceConfigReducers';
import ServiceValidationReducers from '../../reducers/ServiceValidationReducers';
import TabView from '../../../../../../src/js/components/TabView';

class ServiceFormSection extends Component {
  getCMDLabel() {
    let content = (
      <span>
        {"The command value will be wrapped by the underlying Mesos executor via /bin/sh -c ${cmd}. "}
        <a href="https://mesosphere.github.io/marathon/docs/application-basics.html" target="_blank">
          More information
        </a>.
      </span>
    );

    return (
      <label>
        {"Command "}
        <Tooltip
          content={content}
          interactive={true}
          wrapText={true}
          maxWidth={300}
          scrollContainer=".gm-scroll-view">
            <Icon color="grey" id="ring-question" size="mini" family="mini" />
        </Tooltip>
      </label>
    );
  }

  getIDHelpBlock() {
    return (
      <span>
        {"Include the path to your service, if applicable. E.g. /dev/tools/my-service. "}
        <a href="https://mesosphere.github.io/marathon/docs/application-groups.html" target="_blank">
          More information
        </a>.
      </span>
    );
  }

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
                helpBlock={this.getIDHelpBlock()}
                label={<label>SERVICE NAME <span className="text-danger">*</span></label>}
                name="id"
                type="text"
                value={data.id} />
            </div>

            <div className="column-4">
              <FieldInput
                error={errors.instances}
                label={<label>INSTANCES <span className="text-danger">*</span></label>}
                name="instances"
                min={0}
                type="number"
                value={data.instances} />
            </div>
          </div>

          <div className="flex row">
            <div className="column-4">
              <FieldInput
                error={errors.cpus}
                label={<label>CPUs <span className="text-danger">*</span></label>}
                name="cpus"
                type="number"
                step="0.01"
                value={data.cpus} />
            </div>
            <div className="column-4">
              <FieldInput
                error={errors.mem}
                label={<label>MEMORY (MiB) <span className="text-danger">*</span></label>}
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
            helpBlock="A shell command for your container to execute."
            label={this.getCMDLabel()}
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

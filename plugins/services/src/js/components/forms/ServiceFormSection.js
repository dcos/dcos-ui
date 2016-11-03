import React, {Component} from 'react';
import {Tooltip} from 'reactjs-components';

import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldTextarea from '../../../../../../src/js/components/form/FieldTextarea';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import Icon from '../../../../../../src/js/components/Icon';
import ServiceConfigReducers from '../../reducers/ServiceConfigReducers';
import ServiceValidationReducers from '../../reducers/ServiceValidationReducers';

class ServiceFormSection extends Component {
  getCMDLabel() {
    let content = (
      <span>
        {'The command value will be wrapped by the underlying Mesos executor via /bin/sh -c ${cmd}. '}
        <a href="https://mesosphere.github.io/marathon/docs/application-basics.html" target="_blank">
          More information
        </a>.
      </span>
    );

    return (
      <FieldLabel>
        {'Command '}
        <Tooltip
          content={content}
          interactive={true}
          wrapText={true}
          maxWidth={300}
          scrollContainer=".gm-scroll-view">
            <Icon color="grey" id="ring-question" size="mini" family="mini" />
        </Tooltip>
      </FieldLabel>
    );
  }

  getIDHelpBlock() {
    return (
      <span>
        {'Include the path to your service, if applicable. E.g. /dev/tools/my-service. '}
        <a href="https://mesosphere.github.io/marathon/docs/application-groups.html" target="_blank">
          More information
        </a>.
      </span>
    );
  }

  render() {
    let {data, errors} = this.props;

    return (
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
          <FormGroup className="column-8" hasError={Boolean(errors.id)}>
            <FieldLabel>
              Service Name <span className="text-danger">*</span>
            </FieldLabel>
            <FieldInput
              name="id"
              type="text"
              value={data.id} />
            <FieldHelp>{this.getIDHelpBlock()}</FieldHelp>
            <FieldError>{errors.id}</FieldError>
          </FormGroup>

          <FormGroup className="column-4" hasError={Boolean(errors.instances)}>
            <FieldLabel>
              Instances <span className="text-danger">*</span>
            </FieldLabel>
            <FieldInput
              name="instances"
              min={0}
              type="number"
              value={data.instances} />
            <FieldError>{errors.instances}</FieldError>
          </FormGroup>
        </div>

        <div className="flex row">
          <FormGroup className="column-4" hasError={Boolean(errors.cpus)}>
            <FieldLabel>
              CPUs <span className="text-danger">*</span>
            </FieldLabel>
            <FieldInput
              name="cpus"
              type="number"
              step="0.01"
              value={data.cpus} />
            <FieldError>{errors.cpus}</FieldError>
          </FormGroup>
          <FormGroup className="column-4" hasError={Boolean(errors.mem)}>
            <FieldLabel>
              Memory (MiB) <span className="text-danger">*</span>
            </FieldLabel>
            <FieldInput
              name="mem"
              type="number"
              value={data.mem} />
            <FieldError>{errors.mem}</FieldError>
          </FormGroup>
          <FormGroup className="column-4" hasError={Boolean(errors.disk)}>
            <FieldLabel>Disk (MiB)</FieldLabel>
            <FieldInput
              name="disk"
              type="number"
              value={data.disk} />
            <FieldError>{errors.disk}</FieldError>
          </FormGroup>
        </div>

        <FormGroup hasError={Boolean(errors.cmd)}>
          <FieldTextarea
            error={errors.cmd}
            FieldLabel={this.getCMDLabel()}
            name="cmd"
            value={data.cmd} />
            <FieldHelp>
              A shell command for your container to execute.
            </FieldHelp>
          <FieldError>{errors.cmd}</FieldError>
        </FormGroup>
      </div>
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

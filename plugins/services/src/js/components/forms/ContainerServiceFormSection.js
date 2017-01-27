import React, {Component} from 'react';
import {Tooltip} from 'reactjs-components';

import {FormReducer as ContainerReducer} from '../../reducers/serviceForm/Container';
import {FormReducer as ContainersReducer} from '../../reducers/serviceForm/Containers';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import ContainerConstants from '../../constants/ContainerConstants';
import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldTextarea from '../../../../../../src/js/components/form/FieldTextarea';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import FormRow from '../../../../../../src/js/components/form/FormRow';
import Icon from '../../../../../../src/js/components/Icon';
import MetadataStore from '../../../../../../src/js/stores/MetadataStore';

const {NONE} = ContainerConstants.type;

class ContainerServiceFormSection extends Component {
  getCMDLabel() {
    const tooltipContent = (
      <span>
        {'The command value will be wrapped by the underlying Mesos executor via /bin/sh -c ${cmd}. '}
        <a
          href="https://mesosphere.github.io/marathon/docs/application-basics.html"
          target="_blank">
          More information
        </a>.
      </span>
    );

    return (
      <FieldLabel>
        {'Command '}
        <Tooltip
          content={tooltipContent}
          interactive={true}
          wrapText={true}
          maxWidth={300}
          scrollContainer=".gm-scroll-view">
          <Icon color="grey" id="circle-question" size="mini" />
        </Tooltip>
      </FieldLabel>
    );
  }

  getImageLabel() {
    const {data, path} = this.props;
    const containerType = findNestedPropertyInObject(data, `${path}.type`);
    let iconID = 'circle-question';
    let tooltipContent = (
      <span>
        {'Enter a Docker image or browse '}
        <a href="https://hub.docker.com/explore/" target="_blank">
          Docker Hub
        </a>
        {' to find more. You can also enter an image from your private registry. '}
        <a
          href={MetadataStore.buildDocsURI('/usage/tutorials/registry/#docs-article')}
          target="_blank">
          More information
        </a>.
      </span>
    );

    if (containerType == null || containerType === NONE) {
      tooltipContent = 'Mesos Runtime does not support container images, please select Docker Runtime or Universal Container Runtime if you want to use container images.';
      iconID = 'lock';
    }

    return (
      <FieldLabel>
        {'Container Image '}
        <Tooltip
          content={tooltipContent}
          interactive={true}
          wrapText={true}
          maxWidth={300}
          scrollContainer=".gm-scroll-view">
          <Icon color="grey" id={iconID} size="mini" />
        </Tooltip>
      </FieldLabel>
    );
  }

  render() {
    const {data, errors, path} = this.props;
    const containerType = findNestedPropertyInObject(data, `${path}.type`);
    const image = findNestedPropertyInObject(data, `${path}.docker.image`);
    const imageDisabled = containerType == null || containerType === NONE;
    const imageErrors = findNestedPropertyInObject(
      errors,
      `${path}.docker.image`
    );

    return (
      <div className="pod pod-short-top flush-left flush-right">
        <FormRow>
          <FormGroup
            className="column-6"
            showError={Boolean(!imageDisabled && imageErrors)}>
            {this.getImageLabel()}
            <FieldInput
              name={`${path}.docker.image`}
              disabled={imageDisabled}
              value={image} />
            <FieldHelp>
              Enter a Docker image you want to run, e.g. nginx.
            </FieldHelp>
            <FieldError>{imageErrors}</FieldError>
          </FormGroup>

          <FormGroup
            className="column-3"
            required={true}
            showError={Boolean(errors.cpus)}>
            <FieldLabel className="text-no-transform">CPUs</FieldLabel>
            <FieldInput
              min="0.001"
              name="cpus"
              step="any"
              type="number"
              value={data.cpus} />
            <FieldError>{errors.cpus}</FieldError>
          </FormGroup>

          <FormGroup
            className="column-3"
            required={true}
            showError={Boolean(errors.mem)}>
            <FieldLabel className="text-no-transform">MEMORY (MiB)</FieldLabel>
            <FieldInput
              min="0.001"
              name="mem"
              step="any"
              type="number"
              value={data.mem} />
            <FieldError>{errors.mem}</FieldError>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup className="column-12" showError={Boolean(errors.cmd)}>
            {this.getCMDLabel()}
            <FieldTextarea name="cmd" value={data.cmd} />
            <FieldHelp>
              A shell command for your container to execute.
            </FieldHelp>
            <FieldError>{errors.cmd}</FieldError>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

ContainerServiceFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {},
  path: 'container'
};

ContainerServiceFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

ContainerServiceFormSection.configReducers = {
  container: ContainerReducer,
  containers: ContainersReducer
};

module.exports = ContainerServiceFormSection;

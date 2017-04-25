import classNames from 'classnames';
import React, {Component} from 'react';
import {Tooltip} from 'reactjs-components';

import {FormReducer as ContainerReducer} from '../../reducers/serviceForm/Container';
import {FormReducer as ContainersReducer} from '../../reducers/serviceForm/Containers';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import ArtifactsSection from './ArtifactsSection';
import ContainerConstants from '../../constants/ContainerConstants';
import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import FormGroupHeadingContent from '../../../../../../src/js/components/form/FormGroupHeadingContent';
import FormRow from '../../../../../../src/js/components/form/FormRow';
import PodSpec from '../../structs/PodSpec';

const {DOCKER} = ContainerConstants.type;

const appPaths = {
  artifacts: 'fetch',
  cmd: 'cmd',
  containerName: '',
  cpus: 'cpus',
  disk: 'disk',
  forcePullImage: '{basePath}.docker.forcePullImage',
  gpus: 'gpus',
  image: '{basePath}.docker.image',
  mem: 'mem',
  privileged: '{basePath}.docker.privileged',
  type: '{basePath}.type'
};

const podPaths = {
  artifacts: '{basePath}.artifacts',
  cmd: '{basePath}.exec.command.shell',
  containerName: '{basePath}.name',
  cpus: '{basePath}.resources.cpus',
  disk: '{basePath}.resources.disk',
  forcePullImage: '',
  gpus: '',
  image: '{basePath}.image.id',
  mem: '{basePath}.resources.mem',
  privileged: '',
  type: '{basePath}.type'
};

class ContainerServiceFormAdvancedSection extends Component {
  getFieldPath(basePath, fieldName) {
    if (this.props.service instanceof PodSpec) {
      return podPaths[fieldName].replace('{basePath}', basePath);
    }

    return appPaths[fieldName].replace('{basePath}', basePath);
  }

  isGpusDisabled() {
    const {data, path} = this.props;
    const typePath = this.getFieldPath(path, 'type');

    return findNestedPropertyInObject(data, typePath) === DOCKER;
  }

  getGPUSField() {
    const {data, errors, path, service} = this.props;
    if (service instanceof PodSpec) {
      return null;
    }

    const gpusPath = this.getFieldPath(path, 'gpus');
    const gpusErrors = findNestedPropertyInObject(errors, gpusPath);
    const gpusDisabled = this.isGpusDisabled();

    let inputNode = (
      <FieldInput
        disabled={gpusDisabled}
        min="0"
        name={gpusPath}
        step="any"
        type="number"
        value={findNestedPropertyInObject(data, gpusPath)} />
    );

    if (gpusDisabled) {
      inputNode = (
        <Tooltip
          content="Docker Engine does not support GPU resources, please select Universal Container Runtime if you want to use GPU resources."
          interactive={true}
          maxWidth={300}
          scrollContainer=".gm-scroll-view"
          wrapText={true}
          wrapperClassName="tooltip-wrapper tooltip-block-wrapper">
          {inputNode}
        </Tooltip>
      );
    }

    return (
      <FormGroup
        className="column-4"
        showError={Boolean(!gpusDisabled && gpusErrors)}>
        <FieldLabel className="text-no-transform">
          <FormGroupHeadingContent primary={true}>
            GPUs
          </FormGroupHeadingContent>
        </FieldLabel>
        {inputNode}
        <FieldError>{gpusErrors}</FieldError>
      </FormGroup>
    );
  }

  getPrivilegedOption() {
    const {data, errors, path, service} = this.props;
    if (service instanceof PodSpec) {
      return null;
    }

    const typePath = this.getFieldPath(path, 'type');
    const containerType = findNestedPropertyInObject(data, typePath);
    const typeErrors = findNestedPropertyInObject(errors, typePath);
    const settingsPath = this.getFieldPath(path, 'privileged');
    const isChecked = findNestedPropertyInObject(data, settingsPath);
    const isDisabled = containerType !== DOCKER;
    const disabledClassNames = classNames({
      'disabled muted': isDisabled
    });

    let privilegedOption = (
      <FieldLabel key="label-privileged" className={disabledClassNames}>
        <FieldInput
          checked={!isDisabled && Boolean(isChecked)}
          disabled={isDisabled}
          name={settingsPath}
          type="checkbox"
          value="privileged" />
        Grant Runtime Privileges
        <FieldHelp>By default, containers are “unprivileged” and cannot, for example, run a Docker daemon inside a Docker container.</FieldHelp>
      </FieldLabel>
    );

    if (isDisabled) {
      privilegedOption = (
        <Tooltip
          content="Grant runtime privileges is only supported in Docker Runtime."
          key="tooltip-privileged"
          position="top"
          scrollContainer=".gm-scroll-view"
          width={300}
          wrapperClassName="tooltip-wrapper tooltip-block-wrapper"
          wrapText={true}>
          {privilegedOption}
        </Tooltip>
      );
    }

    return (
      <FormGroup showError={Boolean(typeErrors)}>
        {privilegedOption}
        <FieldError>{typeErrors}</FieldError>
      </FormGroup>
    );
  }

  render() {
    const {data, errors, path} = this.props;
    const artifactsPath = this.getFieldPath(path, 'artifacts');
    const artifacts = findNestedPropertyInObject(data, artifactsPath) || [];
    const artifactErrors = findNestedPropertyInObject(
      errors,
      artifactsPath
    ) || [];
    const diskPath = this.getFieldPath(path, 'disk');
    const forcePullImagePath = this.getFieldPath(path, 'forcePullImage');
    const diskErrors = findNestedPropertyInObject(errors, diskPath);

    return (
      <div>
        <h3 className="short-bottom">
          Advanced Settings
        </h3>
        <p>Advanced settings related to the runtime you have selected above.</p>
        {this.getPrivilegedOption()}
        <FieldLabel key="label.forcePullImage" className="flush-bottom">
          <FieldInput
            checked={findNestedPropertyInObject(data, forcePullImagePath)}
            name={forcePullImagePath}
            type="checkbox"
            value="forcePullImage" />
          Force Pull Image On Launch
          <FieldHelp>Force Docker to pull the image before launching each instance.</FieldHelp>
        </FieldLabel>
        <FormRow>
          {this.getGPUSField()}
          <FormGroup className="column-4" showError={Boolean(diskErrors)}>
            <FieldLabel className="text-no-transform">
              <FormGroupHeadingContent primary={true}>
                Disk (MiB)
              </FormGroupHeadingContent>
            </FieldLabel>
            <FieldInput
              min="0.001"
              name={diskPath}
              step="any"
              type="number"
              value={findNestedPropertyInObject(data, diskPath)} />
            <FieldError>{diskErrors}</FieldError>
          </FormGroup>
        </FormRow>
        <ArtifactsSection
          data={artifacts}
          path={artifactsPath}
          errors={artifactErrors}
          onRemoveItem={this.props.onRemoveItem}
          onAddItem={this.props.onAddItem} />
      </div>
    );
  }
}

ContainerServiceFormAdvancedSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {},
  path: 'container'
};

ContainerServiceFormAdvancedSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func,
  path: React.PropTypes.string
};

ContainerServiceFormAdvancedSection.configReducers = {
  container: ContainerReducer,
  containers: ContainersReducer
};

module.exports = ContainerServiceFormAdvancedSection;

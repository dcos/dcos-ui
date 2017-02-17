import classNames from 'classnames';
import React, {Component} from 'react';
import {Tooltip} from 'reactjs-components';

import {FormReducer as ContainerReducer} from '../../reducers/serviceForm/Container';
import {FormReducer as ContainersReducer} from '../../reducers/serviceForm/Containers';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import AddButton from '../../../../../../src/js/components/form/AddButton';
import ContainerConstants from '../../constants/ContainerConstants';
import DeleteRowButton from '../../../../../../src/js/components/form/DeleteRowButton';
import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import FormRow from '../../../../../../src/js/components/form/FormRow';
import Icon from '../../../../../../src/js/components/Icon';
import PodSpec from '../../structs/PodSpec';

const {DOCKER} = ContainerConstants.type;

const containerSettings = {
  privileged: {
    label: 'Grant Runtime Privileges',
    helpText: 'By default, containers are “unprivileged” and cannot, for example, run a Docker daemon inside a Docker container.',
    dockerOnly: 'Grant runtime privileges is only supported in Docker Runtime.'
  },
  forcePullImage: {
    label: 'Force Pull Image On Launch',
    helpText: 'Force Docker to pull the image before launching each instance.',
    dockerOnly: 'Force pull image on launch is only supported in Docker Runtime.'
  }
};

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

  getArtifactsLabel() {
    const tooltipContent = (
      <span>
        {'If your service requires additional files and/or archives of files, enter their URIs to download and, if necessary, extract these resources. '}
        <a
          href="https://mesosphere.github.io/marathon/docs/application-basics.html"
          target="_blank">
          More information
        </a>.
      </span>
    );

    return (
      <FieldLabel>
        {'Artifact URI '}
        <Tooltip
          content={tooltipContent}
          interactive={true}
          maxWidth={300}
          scrollContainer=".gm-scroll-view"
          wrapText={true}>
          <Icon color="grey" id="circle-question" size="mini" />
        </Tooltip>
      </FieldLabel>
    );
  }

  getArtifactsInputs() {
    const {data, errors, path} = this.props;
    const artifactsPath = this.getFieldPath(path, 'artifacts');
    const artifacts = findNestedPropertyInObject(data, artifactsPath) || [];
    const artifactErrors = findNestedPropertyInObject(
      errors,
      artifactsPath
    ) || [];

    if (artifacts.length === 0) {
      return (
        <FormRow>
          <FormGroup className="column-10">
            {this.getArtifactsLabel()}
          </FormGroup>
        </FormRow>
      );
    }

    return artifacts.map((item, index) => {
      const error = findNestedPropertyInObject(artifactErrors, `${index}.uri`);
      let label = null;
      if (index === 0) {
        label = this.getArtifactsLabel();
      }

      return (
        <FormRow key={`${artifactsPath}.${index}`}>
          <FormGroup
            className="column-10"
            showError={Boolean(error)}>
            {label}
            <FieldInput
              name={`${artifactsPath}.${index}.uri`}
              placeholder="http://example.com"
              value={item.uri}/>
            <FieldError>{error}</FieldError>
          </FormGroup>
          <FormGroup className="flex flex-item-align-end column-2 flush-left">
            <DeleteRowButton
              onClick={this.props.onRemoveItem.bind(
                this,
                {value: index, path: artifactsPath}
              )} />
          </FormGroup>
        </FormRow>
      );
    });
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
          GPUs
        </FieldLabel>
        {inputNode}
        <FieldError>{gpusErrors}</FieldError>
      </FormGroup>
    );
  }

  getContainerSettings() {
    const {data, errors, path, service} = this.props;
    if (service instanceof PodSpec) {
      return null;
    }

    const typePath = this.getFieldPath(path, 'type');
    const containerType = findNestedPropertyInObject(data, typePath);
    const typeErrors = findNestedPropertyInObject(errors, typePath);
    const sectionCount = Object.keys(containerSettings).length;
    const selections = Object.keys(containerSettings).map((settingName, index) => {
      const {helpText, label, dockerOnly} = containerSettings[settingName];
      const settingsPath = this.getFieldPath(path, settingName);
      const checked = findNestedPropertyInObject(data, settingsPath);
      const isDisabled = containerType !== DOCKER;
      const labelNodeClasses = classNames({
        'disabled muted': isDisabled,
        'flush-bottom': (index === sectionCount - 1)
      });

      let labelNode = (
        <FieldLabel key={`label.${index}`} className={labelNodeClasses}>
          <FieldInput
            checked={!isDisabled && Boolean(checked)}
            name={settingsPath}
            type="checkbox"
            disabled={isDisabled}
            value={settingName} />
          {label}
          <FieldHelp>{helpText}</FieldHelp>
        </FieldLabel>
      );

      if (isDisabled) {
        labelNode = (
          <Tooltip
            content={dockerOnly}
            key={`tooltip.${index}`}
            position="top"
            scrollContainer=".gm-scroll-view"
            width={300}
            wrapperClassName="tooltip-wrapper tooltip-block-wrapper"
            wrapText={true}>
            {labelNode}
          </Tooltip>
        );
      }

      return labelNode;
    });

    return (
      <FormGroup showError={Boolean(typeErrors)}>
        {selections}
        <FieldError>{typeErrors}</FieldError>
      </FormGroup>
    );
  }

  render() {
    const {data, errors, path} = this.props;
    const artifactsPath = this.getFieldPath(path, 'artifacts');
    const artifacts = findNestedPropertyInObject(data, artifactsPath) || [];
    const diskPath = this.getFieldPath(path, 'disk');
    const diskErrors = findNestedPropertyInObject(errors, diskPath);

    return (
      <div>
        <h3 className="short-top short-bottom">
          Advanced Settings
        </h3>
        <p>Advanced settings related to the runtime you have selected above.</p>
        {this.getContainerSettings()}
        <FormRow>
          {this.getGPUSField()}
          <FormGroup className="column-4" showError={Boolean(diskErrors)}>
            <FieldLabel className="text-no-transform">Disk (MiB)</FieldLabel>
            <FieldInput
              min="0.001"
              name={diskPath}
              step="any"
              type="number"
              value={findNestedPropertyInObject(data, diskPath)} />
            <FieldError>{diskErrors}</FieldError>
          </FormGroup>
        </FormRow>
        {this.getArtifactsInputs()}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton
              onClick={this.props.onAddItem.bind(
                this,
                {value: artifacts.length, path: artifactsPath}
              )}>
              Add Artifact
            </AddButton>
          </FormGroup>
        </FormRow>
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

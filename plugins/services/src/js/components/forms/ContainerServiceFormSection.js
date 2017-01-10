import React, {Component} from 'react';
import {Tooltip} from 'reactjs-components';

import {FormReducer as ContainerReducer} from '../../reducers/serviceForm/Container';
import {FormReducer as ContainersReducer} from '../../reducers/serviceForm/Containers';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import AdvancedSection from '../../../../../../src/js/components/form/AdvancedSection';
import AdvancedSectionContent from '../../../../../../src/js/components/form/AdvancedSectionContent';
import AdvancedSectionLabel from '../../../../../../src/js/components/form/AdvancedSectionLabel';
import ContainerConstants from '../../constants/ContainerConstants';
import DeleteRowButton from '../../../../../../src/js/components/form/DeleteRowButton';
import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldTextarea from '../../../../../../src/js/components/form/FieldTextarea';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import FormRow from '../../../../../../src/js/components/form/FormRow';
import Icon from '../../../../../../src/js/components/Icon';
import MetadataStore from '../../../../../../src/js/stores/MetadataStore';

const {DOCKER, NONE, MESOS} = ContainerConstants.type;

const containerSettings = {
  privileged: {
    label: <span>Grant Runtime Privileges</span>,
    helpText: 'By default, containers are “unprivileged” and cannot, for example, run a Docker daemon inside a Docker container.',
    dockerOnly: 'Grant runtime privileges is only supported in Docker Runtime.'
  },
  forcePullImage: {
    label: <span>Force Pull Image On Launch</span>,
    helpText: 'Force Docker to pull the image before launching each instance.',
    dockerOnly: 'Force pull image on launch is only supported in Docker Runtime.'
  }
};

const getArtifactsLabel = () => {
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
};

class ContainerServiceFormSection extends Component {
  getArtifactsInputs(data = []) {
    const errors = this.props.errors.fetch || [];

    let content = data.map((item, index) => {
      let label = null;
      if (index === 0) {
        label = getArtifactsLabel();
      }

      return (
        <FormRow key={index}>
          <FormGroup className="column-10" showError={Boolean(errors[index])}>
            {label}
            <FieldInput
              name={`fetch.${index}.uri`}
              placeholder="http://"
              value={item.uri}/>
            <FieldError>{errors[index]}</FieldError>
          </FormGroup>
          <FormGroup className="flex flex-item-align-end column-2">
            <DeleteRowButton
              onClick={this.props.onRemoveItem.bind(
                this,
                {value: index, path: 'fetch'}
              )} />
          </FormGroup>
        </FormRow>
      );
    });

    if (data.length === 0) {
      content = (
        <FormRow>
          <FormGroup className="column-10">
            {getArtifactsLabel()}
          </FormGroup>
        </FormRow>
      );
    }

    return content;
  }

  getGPUSInput(data) {
    const disabled = data.container && data.container.type !== MESOS;
    const inputFiled = (
      <FieldInput
        key="gpus-input"
        min="0"
        name="gpus"
        step="any"
        type="number"
        disabled={disabled}
        value={data.gpus} />
    );

    if (disabled) {
      return [
        <FieldLabel className="text-no-transform" key="gpus-input-tooltip">
          {'GPUs '}
          <Tooltip
            content="Docker Engine does not support GPU resources, please select Universal Container Runtime if you want to use GPU resources."
            interactive={true}
            maxWidth={300}
            scrollContainer=".gm-scroll-view"
            wrapText={true}>
            <Icon color="grey" id="lock" size="mini" />
          </Tooltip>
        </FieldLabel>,
        inputFiled
      ];
    }

    return [
      <FieldLabel className="text-no-transform" key="gpus-label">
        GPUs
      </FieldLabel>,
      inputFiled
    ];
  }

  getAdvancedSettings(data = {}, errors = {}) {
    const containerType = findNestedPropertyInObject(data.container, 'type');
    const typeErrors = errors.container && errors.container.type;
    const gpuDisabled = containerType !== MESOS;
    const selections = Object.keys(containerSettings).map((settingName, index) => {
      const {helpText, label, dockerOnly} = containerSettings[settingName];
      const checked = findNestedPropertyInObject(
        data.container,
        `docker.${settingName}`
      );

      const inputField = (
        <FieldInput
          checked={containerType === DOCKER && Boolean(checked)}
          name={`container.docker.${settingName}`}
          type="checkbox"
          disabled={containerType !== DOCKER}
          value={settingName} />
      );

      if (containerType !== DOCKER) {
        return (
          <FieldLabel key={index}>
            {inputField}
            {label}{' '}
            <Tooltip
              content={dockerOnly}
              interactive={true}
              maxWidth={300}
              scrollContainer=".gm-scroll-view"
              wrapText={true}>
              <Icon color="grey" id="lock" size="mini" />
            </Tooltip>
            <FieldHelp>{helpText}</FieldHelp>
          </FieldLabel>
        );
      }

      return (
        <FieldLabel key={index}>
          {inputField}
          {label}
          <FieldHelp>{helpText}</FieldHelp>
        </FieldLabel>
      );
    });

    return (
      <AdvancedSectionContent>
        <FormGroup showError={Boolean(typeErrors)}>
          {selections}
          <FieldError>{typeErrors}</FieldError>
        </FormGroup>

        <FormRow>
          <FormGroup className="column-4" showError={Boolean(!gpuDisabled && errors.gpus)}>
            {this.getGPUSInput(data)}
            <FieldError>{errors.gpus}</FieldError>
          </FormGroup>
          <FormGroup className="column-4" showError={Boolean(errors.disk)}>
            <FieldLabel className="text-no-transform">DISK (MiB)</FieldLabel>
            <FieldInput
              min="0.001"
              name="disk"
              step="any"
              type="number"
              value={data.disk} />
            <FieldError>{errors.disk}</FieldError>
          </FormGroup>
        </FormRow>
        {this.getArtifactsInputs(data.fetch)}
        <FormRow>
          <FormGroup className="column-12">
            <a
              className="button button-primary-link button-flush"
              onClick={this.props.onAddItem.bind(
                this,
                {value: data.fetch.length, path: 'fetch'}
              )}>
              <Icon color="purple" id="plus" size="tiny" /> Add Artifact
            </a>
          </FormGroup>
        </FormRow>
      </AdvancedSectionContent>
    );
  }

  getCMDLabel() {
    let tooltipContent = (
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

    return (
      <FieldLabel key="image-label">
        {'Container Image '}
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

  getImageInput(data) {
    const {container = {}} = data;
    const image = findNestedPropertyInObject(container, 'docker.image');

    if (container == null || container.type == null ||
        container.type === NONE) {
      return [
        <FieldLabel key="container-image-input-tooltip">
          {'Container Image '}
          <Tooltip
            content="Mesos Runtime does not support container images, please select Docker Runtime or Universal Container Runtime if you want to use container images."
            interactive={true}
            maxWidth={300}
            scrollContainer=".gm-scroll-view"
            wrapText={true}>
            <Icon color="grey" id="lock" size="mini" />
          </Tooltip>
        </FieldLabel>,
        <FieldInput
          key="container-image-input"
          name="container.docker.image"
          disabled={true}
          value={image} />,
        <FieldHelp>Enter a Docker image you want to run, e.g. nginx.</FieldHelp>
      ];
    }

    return [
      this.getImageLabel(),
      <FieldInput
        key="image-field"
        name="container.docker.image"
        value={image} />,
      <FieldHelp key="image-help">
        Enter a Docker image you want to run, e.g. nginx.
      </FieldHelp>
    ];
  }

  render() {
    const {data, errors} = this.props;

    const imageErrors = findNestedPropertyInObject(
      errors,
      'container.docker.image'
    );

    const containerType = findNestedPropertyInObject(
      data,
      'container.type'
    );

    return (
      <div>
        <h2 className="short-top short-bottom">
          Container
        </h2>
        <p>
          Configure your container below. Enter a container image or command you want to run.
        </p>
        <FormRow>
          <FormGroup
            className="column-6"
            showError={Boolean(containerType != null && containerType !== NONE && imageErrors)}>
            {this.getImageInput(data)}
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

        <AdvancedSection>
          <AdvancedSectionLabel>
            Advanced Container Settings
          </AdvancedSectionLabel>
          {this.getAdvancedSettings(data, errors)}
        </AdvancedSection>
      </div>
    );
  }
}

ContainerServiceFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {}
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

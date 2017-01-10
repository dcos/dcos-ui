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

class ContainerServiceFormSection extends Component {
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
    const artifacts = findNestedPropertyInObject(data, `${path}.fetch`) || [];
    const artifactErrors = findNestedPropertyInObject(
      errors,
      `${path}.fetch`
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
      let label = null;
      if (index === 0) {
        label = this.getArtifactsLabel();
      }

      return (
        <FormRow key={`${path}.artifacts.${index}`}>
          <FormGroup
            className="column-10"
            showError={Boolean(artifactErrors[index])}>
            {label}
            <FieldInput
              name={`fetch.${index}.uri`}
              placeholder="http://"
              value={item.uri}/>
            <FieldError>{artifactErrors[index]}</FieldError>
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
  }

  getGPUSLabel() {
    const {data, path} = this.props;
    const disabled = findNestedPropertyInObject(data, `${path}.type`) !== MESOS;

    if (disabled) {
      return (
        <FieldLabel className="text-no-transform">
          {'GPUs '}
          <Tooltip
            content="Docker Engine does not support GPU resources, please select Universal Container Runtime if you want to use GPU resources."
            interactive={true}
            maxWidth={300}
            scrollContainer=".gm-scroll-view"
            wrapText={true}>
            <Icon color="grey" id="lock" size="mini" />
          </Tooltip>
        </FieldLabel>
      );
    }

    return (
      <FieldLabel className="text-no-transform">
        GPUs
      </FieldLabel>
    );
  }

  getTooltipIfContent(content) {
    if (!content) {
      return null;
    }

    return (
      <Tooltip
        content={content}
        interactive={true}
        maxWidth={300}
        scrollContainer=".gm-scroll-view"
        wrapText={true}>
        <Icon color="grey" id="lock" size="mini" />
      </Tooltip>
    );
  }

  getAdvancedSettings() {
    const {data, errors, path} = this.props;
    const container = findNestedPropertyInObject(data, path) || {};
    const artifactIndex = findNestedPropertyInObject(container, 'fetch.length');
    const containerType = container.type;
    const gpuDisabled = containerType !== MESOS;
    const typeErrors = findNestedPropertyInObject(errors, `${path}.type`);
    const selections = Object.keys(containerSettings).map((settingName, index) => {
      let {helpText, label, dockerOnly} = containerSettings[settingName];
      const checked = findNestedPropertyInObject(
        container,
        `docker.${settingName}`
      );

      if (containerType === DOCKER) {
        dockerOnly = '';
      } else {
        label = label + ' ';
      }

      return (
        <FieldLabel key={index}>
          <FieldInput
            checked={containerType === DOCKER && Boolean(checked)}
            name={`${path}.docker.${settingName}`}
            type="checkbox"
            disabled={containerType !== DOCKER}
            value={settingName} />
          {label}
          {this.getTooltipIfContent(dockerOnly)}
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
          <FormGroup
            className="column-4"
            showError={Boolean(!gpuDisabled && errors.gpus)}>
            {this.getGPUSLabel()}
            <FieldInput
              disabled={gpuDisabled}
              min="0"
              name="gpus"
              step="any"
              type="number"
              value={data.gpus} />
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
        {this.getArtifactsInputs()}
        <FormRow>
          <FormGroup className="column-12">
            <a
              className="button button-primary-link button-flush"
              onClick={this.props.onAddItem.bind(
                this,
                {value: artifactIndex, path: 'fetch'}
              )}>
              <Icon color="purple" id="plus" size="tiny" /> Add Artifact
            </a>
          </FormGroup>
        </FormRow>
      </AdvancedSectionContent>
    );
  }

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

        <AdvancedSection>
          <AdvancedSectionLabel>
            Advanced Container Settings
          </AdvancedSectionLabel>
          {this.getAdvancedSettings()}
        </AdvancedSection>
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

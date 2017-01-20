import React, {Component} from 'react';
import {Tooltip} from 'reactjs-components';

import {FormReducer as ContainerReducer} from '../../reducers/serviceForm/Container';
import {FormReducer as ContainersReducer} from '../../reducers/serviceForm/Containers';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import AdvancedSection from '../../../../../../src/js/components/form/AdvancedSection';
import AdvancedSectionContent from '../../../../../../src/js/components/form/AdvancedSectionContent';
import AdvancedSectionLabel from '../../../../../../src/js/components/form/AdvancedSectionLabel';
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

class PodContainerServiceFormSection extends Component {
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
    const artifactErrors = findNestedPropertyInObject(
      errors,
      `${path}.artifacts`
    ) || [];
    const artifacts = findNestedPropertyInObject(
      data,
      `${path}.artifacts`
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
              name={`${path}.artifacts.${index}.uri`}
              placeholder="http://example.com"
              value={item} />
            <FieldError>{artifactErrors[index]}</FieldError>
          </FormGroup>
          <FormGroup className="flex flex-item-align-end column-2">
            <DeleteRowButton
              onClick={this.props.onRemoveItem.bind(
                this,
                {value: index, path: `${path}.artifacts`}
              )} />
          </FormGroup>
        </FormRow>
      );
    });
  }

  getAdvancedSettings() {
    const {data, errors, path} = this.props;
    const diskErrors = findNestedPropertyInObject(
      errors,
      `${path}.resources.disk`
    );

    return (
      <AdvancedSectionContent>
        <FormRow>
          <FormGroup className="column-4" showError={Boolean(diskErrors)}>
            <FieldLabel className="text-no-transform">DISK (MiB)</FieldLabel>
            <FieldInput
              min="0.001"
              name={`${path}.resources.disk`}
              step="any"
              type="number"
              value={findNestedPropertyInObject(
                data,
                `${path}.resources.disk`
              )} />
            <FieldError>{diskErrors}</FieldError>
          </FormGroup>
        </FormRow>
        {this.getArtifactsInputs()}
        <FormRow>
          <FormGroup className="column-12">
            <a
              className="button button-primary-link button-flush"
              onClick={this.props.onAddItem.bind(
                this,
                {value: 0, path: `${path}.artifacts`}
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
    const tooltipContent = (
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
      <FieldLabel>
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

  render() {
    const {data, errors, path} = this.props;
    const container = findNestedPropertyInObject(data, path) || {};
    const containerErrors = findNestedPropertyInObject(errors, path) || {};
    const imageErrors = findNestedPropertyInObject(containerErrors, 'image.id');
    const cpusErrors = findNestedPropertyInObject(
      containerErrors,
      'resources.cpus'
    );
    const memErrors = findNestedPropertyInObject(
      containerErrors,
      'resources.mem'
    );
    const commandErrors = findNestedPropertyInObject(
      containerErrors,
      'exec.command.shell'
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
          <FormGroup className="column-6" showError={Boolean(imageErrors)}>
            <FieldLabel>Container Name</FieldLabel>
            <FieldInput
              name={`${path}.name`}
              value={findNestedPropertyInObject(data, `${path}.name`)} />
            <FieldError>{imageErrors}</FieldError>
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup className="column-6" showError={Boolean(imageErrors)}>
            {this.getImageLabel()}
            <FieldInput
              name={`${path}.image`}
              value={container.image} />
            <FieldHelp>
              Enter a Docker image you want to run, e.g. nginx.
            </FieldHelp>
            <FieldError>{imageErrors}</FieldError>
          </FormGroup>

          <FormGroup
            className="column-3"
            required={true}
            showError={Boolean(cpusErrors)}>
            <FieldLabel className="text-no-transform">CPUs</FieldLabel>
            <FieldInput
              min="0.001"
              name={`${path}.resources.cpus`}
              step="any"
              type="number"
              value={findNestedPropertyInObject(container, 'resources.cpus')} />
            <FieldError>{cpusErrors}</FieldError>
          </FormGroup>

          <FormGroup
            className="column-3"
            required={true}
            showError={Boolean(memErrors)}>
            <FieldLabel className="text-no-transform">MEMORY (MiB)</FieldLabel>
            <FieldInput
              min="0.001"
              name={`${path}.resources.mem`}
              step="any"
              type="number"
              value={findNestedPropertyInObject(container, 'resources.mem')} />
            <FieldError>{memErrors}</FieldError>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup className="column-12" showError={Boolean(commandErrors)}>
            {this.getCMDLabel()}
            <FieldTextarea
              name={`${path}.exec.command.shell`}
              value={findNestedPropertyInObject(
                container,
                'exec.command.shell'
              )} />
            <FieldHelp>
              A shell command for your container to execute.
            </FieldHelp>
            <FieldError>{commandErrors}</FieldError>
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

PodContainerServiceFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {},
  path: 'container'
};

PodContainerServiceFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  path: React.PropTypes.string,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

PodContainerServiceFormSection.configReducers = {
  container: ContainerReducer,
  containers: ContainersReducer
};

module.exports = PodContainerServiceFormSection;

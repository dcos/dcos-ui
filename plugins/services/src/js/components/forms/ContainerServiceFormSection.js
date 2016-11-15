import React, {Component} from 'react';
import {Tooltip} from 'reactjs-components';

import {FormReducer} from '../../reducers/serviceForm/Container';
import AdvancedSection from '../../../../../../src/js/components/form/AdvancedSection';
import AdvancedSectionContent from '../../../../../../src/js/components/form/AdvancedSectionContent';
import AdvancedSectionLabel from '../../../../../../src/js/components/form/AdvancedSectionLabel';
import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldTextarea from '../../../../../../src/js/components/form/FieldTextarea';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import MetadataStore from '../../../../../../src/js/stores/MetadataStore';
import Icon from '../../../../../../src/js/components/Icon';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';

const containerSettings = {
  privileged: {
    label: <span>Grant Runtime Privileges</span>,
    helpText: 'By default, containers are “unprivileged” and cannot, for example, run a Docker daemon inside a Docker container.'
  },
  forcePullImage: {
    label: <span>Force Pull Image On Launch</span>,
    helpText: 'Force Docker to pull the image before launching each task.'
  }
};

class ContainerServiceFormSection extends Component {
  getAdvancedSettings(data = {}, errors = {}) {
    let {container = {}} = data;
    let typeErrors = errors.container && errors.container.type;
    let selections = Object.keys(containerSettings).map((settingName, index) => {
      let {helpText, label} = containerSettings[settingName];
      let checked = findNestedPropertyInObject(
        container,
        `docker.${settingName}`
      );

      return (
        <FieldLabel key={index}>
          <FieldInput
            checked={Boolean(checked)}
            name={`container.docker.${settingName}`}
            type="checkbox"
            value={settingName} />
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

        <div className="flex row">
          <FormGroup className="column-4" showError={Boolean(errors.disk)}>
            <FieldLabel>Disk (MiB)</FieldLabel>
            <FieldInput
              name="disk"
              type="number"
              value={data.disk} />
            <FieldError>{errors.disk}</FieldError>
          </FormGroup>
        </div>
      </AdvancedSectionContent>
    );
  }

  getCMDLabel() {
    let tooltipContent = (
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
          content={tooltipContent}
          interactive={true}
          wrapText={true}
          maxWidth={300}
          scrollContainer=".gm-scroll-view">
            <Icon color="grey" id="ring-question" size="mini" family="mini" />
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
        <a href={MetadataStore.buildDocsURI('/usage/tutorials/registry/#docs-article')} target="_blank">
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
            <Icon color="grey" id="ring-question" size="mini" family="mini" />
        </Tooltip>
      </FieldLabel>
    );
  }

  render() {
    let {data, errors} = this.props;

    let {container = {}} = data;
    let image = findNestedPropertyInObject(container, 'docker.image');
    let imageErrors = findNestedPropertyInObject(
      errors,
      'container.docker.image'
    );

    return (
      <div>
        <h2 className="short-top short-bottom">
          Container
        </h2>
        <p>Configure your container below. Enter a container image or command you want to run.</p>
        <div className="flex row">
          <FormGroup className="column-6" showError={Boolean(imageErrors)}>
            {this.getImageLabel()}
            <FieldInput
              name="container.docker.image"
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
            <FieldLabel>
              CPUs
            </FieldLabel>
            <FieldInput
              name="cpus"
              type="number"
              step="0.01"
              value={data.cpus} />
            <FieldError>{errors.cpus}</FieldError>
          </FormGroup>
          <FormGroup
            className="column-3"
            required={true}
            showError={Boolean(errors.mem)}>
            <FieldLabel>
              Memory (MiB)
            </FieldLabel>
            <FieldInput
              name="mem"
              type="number"
              value={data.mem} />
            <FieldError>{errors.mem}</FieldError>
          </FormGroup>
        </div>

        <FormGroup showError={Boolean(errors.cmd)}>
          {this.getCMDLabel()}
          <FieldTextarea name="cmd" value={data.cmd} />
          <FieldHelp>
            A shell command for your container to execute.
          </FieldHelp>
          <FieldError>{errors.cmd}</FieldError>
        </FormGroup>

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
  errors: {}
};

ContainerServiceFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object
};

ContainerServiceFormSection.configReducers = {
  container: FormReducer
};

module.exports = ContainerServiceFormSection;

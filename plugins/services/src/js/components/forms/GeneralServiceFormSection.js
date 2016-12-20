import React, {Component} from 'react';
import {Tooltip} from 'reactjs-components';

import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import AdvancedSection from '../../../../../../src/js/components/form/AdvancedSection';
import AdvancedSectionContent from '../../../../../../src/js/components/form/AdvancedSectionContent';
import AdvancedSectionLabel from '../../../../../../src/js/components/form/AdvancedSectionLabel';
import ContainerConstants from '../../constants/ContainerConstants';
import ContainerServiceFormSection from './ContainerServiceFormSection';
import DeleteRowButton from '../../../../../../src/js/components/form/DeleteRowButton';
import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import FormRow from '../../../../../../src/js/components/form/FormRow';
import General from '../../reducers/serviceForm/General';
import Icon from '../../../../../../src/js/components/Icon';
import MetadataStore from '../../../../../../src/js/stores/MetadataStore';
import ValidatorUtil from '../../../../../../src/js/utils/ValidatorUtil';

const {type: {MESOS, DOCKER, NONE}, labelMap} = ContainerConstants;

const containerRuntimes = {
  [NONE]: {
    label: <span>{labelMap[NONE]}</span>,
    helpText: 'Normal behaviour'
  },
  [MESOS]: {
    label: <span>{labelMap[MESOS]}</span>,
    helpText: 'Native container engine in Mesos using standard Linux features. Supports multiple containers (Pods) and GPU resources.'
  },
  [DOCKER]: {
    label: <span>{labelMap[DOCKER]} <em>(recommended)</em></span>,
    helpText: 'Docker’s container runtime. No support for multiple containers (Pods) or GPU resources.'
  }
};

class GeneralServiceFormSection extends Component {
  getPlacementConstraints(data = []) {
    const errors = this.props.errors || [];

    return data.map((constraint, index) => {
      let fieldLabel = null;
      let operatorLabel = null;
      let parameterLabel = null;
      if (index === 0) {
        fieldLabel = <FieldLabel>Field</FieldLabel>;
        operatorLabel = <FieldLabel>Operator</FieldLabel>;
        parameterLabel = <FieldLabel>Parameter</FieldLabel>;
      }

      return (
        <FormRow key={index}>
          <FormGroup
            className="column-3"
            required={true}
            showError={Boolean(errors[index])}>
            {fieldLabel}
            <FieldInput
              name={`constraints.${index}.field`}
              type="text"
              value={constraint.field}/>
            <FieldError>{errors[index]}</FieldError>
          </FormGroup>
          <FormGroup
            className="column-3"
            required={true}
            showError={Boolean(errors[index])}>
            {operatorLabel}
            <FieldInput
              name={`constraints.${index}.operator`}
              type="text"
              value={constraint.operator}/>
            <FieldError>{errors[index]}</FieldError>
          </FormGroup>
          <FormGroup
            className="column-3"
            showError={Boolean(errors[index])}>
            {parameterLabel}
            <FieldInput
              name={`constraints.${index}.value`}
              type="text"
              value={constraint.value}/>
            <FieldError>{errors[index]}</FieldError>
          </FormGroup>

          <FormGroup className="flex flex-item-align-end column-2 flush-left">
            <DeleteRowButton
              onClick={this.props.onRemoveItem.bind(this, {value: index, path: 'constraints'})}/>
          </FormGroup>
        </FormRow>
      );
    });
  }
  getRuntimeSelections(data = {}) {
    const {container = {}, gpus} = data;
    const isDisabled = {};
    let disabledTooltipContent;
    let type = NONE;

    if (container != null && container.type != null) {
      type = container.type;
    }

    if (!ValidatorUtil.isEmpty(gpus) && gpus !== 0) {
      isDisabled[DOCKER] = true;
      disabledTooltipContent = 'Docker Engine does not support GPU resources, please select Universal Container Runtime if you want to use GPU resources.';
    }

    return Object.keys(containerRuntimes).map((runtimeName, index) => {
      let {helpText, label} = containerRuntimes[runtimeName];
      let field = (
        <FieldLabel className="text-align-left" key={index}>
          <FieldInput
            checked={Boolean(type === runtimeName)}
            disabled={isDisabled[runtimeName]}
            name="container.type"
            type="radio"
            value={runtimeName} />
          {label}
          <FieldHelp>{helpText}</FieldHelp>
        </FieldLabel>
      );

      // Wrap field in tooltip if disabled and content populated
      if (isDisabled[runtimeName] && disabledTooltipContent) {
        field = (
          <Tooltip
            content={disabledTooltipContent}
            interactive={true}
            key={index}
            maxWidth={300}
            scrollContainer=".gm-scroll-view"
            wrapText={true}>
            {field}
          </Tooltip>
        );
      }

      return field;
    });
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
    let typeErrors = findNestedPropertyInObject(errors, 'container.type');
    let runtimeTooltipContent = (
      <span>
        {'You can run Docker containers with both container runtimes. The Universal Container Runtime is better supported in DC/OS. '}
        <a href={MetadataStore.buildDocsURI('/usage/containerizers/')} target="_blank">
          More information
        </a>.
      </span>
    );

    return (
      <div>
        <h2 className="flush-top short-bottom">
          Services
        </h2>
        <p>
          Configure your service below. Start by giving your service a name.
        </p>

        <FormRow>
          <FormGroup
            className="column-8"
            required={true}
            showError={Boolean(errors.id)}>
            <FieldLabel>
              Service Name
            </FieldLabel>
            <FieldInput
              name="id"
              type="text"
              value={data.id} />
            <FieldHelp>{this.getIDHelpBlock()}</FieldHelp>
            <FieldError>{errors.id}</FieldError>
          </FormGroup>

          <FormGroup
            className="column-4"
            showError={Boolean(errors.instances)}>
            <FieldLabel>
              Instances
            </FieldLabel>
            <FieldInput
              name="instances"
              min={0}
              type="number"
              value={data.instances} />
            <FieldError>{errors.instances}</FieldError>
          </FormGroup>
        </FormRow>

        <h3 className="short-bottom">
          {'Container Runtime '}
          <Tooltip
            content={runtimeTooltipContent}
            interactive={true}
            maxWidth={300}
            scrollContainer=".gm-scroll-view"
            wrapText={true}>
            <Icon color="grey" id="circle-question" size="mini" />
          </Tooltip>
        </h3>
        <p>The container runtime is responsible for running your service. We support the Mesos and Docker containerizers.</p>
        <FormGroup showError={Boolean(typeErrors)}>
          {this.getRuntimeSelections(data)}
          <FieldError>{typeErrors}</FieldError>
        </FormGroup>
        <AdvancedSection>
          <AdvancedSectionLabel>
            Advanced Service Settings
          </AdvancedSectionLabel>
          <AdvancedSectionContent>
            <h3 className="short-top short-bottom">
              {'Placement Constraints '}
              <Tooltip
                content="Constraints have three parts: a field name, an operator, and an optional parameter. The field can be the hostname of the agent node or any attribute of the agent node."
                interactive={true}
                maxWidth={300}
                scrollContainer=".gm-scroll-view"
                wrapText={true}>
                <Icon color="grey" id="circle-question" size="mini" />
              </Tooltip>
            </h3>
            <p>Constraints control where apps run to allow optimization for either fault tolerance or locality.</p>
            {this.getPlacementConstraints(data.constraints)}
            <FormRow>
              <FormGroup className="column-12">
                <a
                  className="button button-primary-link button-flush"
                  onClick={this.props.onAddItem.bind(this, {value: data.constraints.length, path: 'constraints'})}>
                  <Icon color="purple" id="plus" size="tiny" /> Add Placement Constraint
                </a>
              </FormGroup>
            </FormRow>
          </AdvancedSectionContent>
        </AdvancedSection>

        <ContainerServiceFormSection
          data={data}
          errors={errors}
          onAddItem={this.props.onAddItem}
          onRemoveItem={this.props.onRemoveItem} />
      </div>
    );
  }
}

GeneralServiceFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {}
};

GeneralServiceFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

GeneralServiceFormSection.configReducers = General;

module.exports = GeneralServiceFormSection;

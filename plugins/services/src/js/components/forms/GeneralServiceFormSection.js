import React, {Component} from 'react';
import {Confirm, Tooltip} from 'reactjs-components';

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
import Pod from '../../structs/Pod';
import Icon from '../../../../../../src/js/components/Icon';
import General from '../../reducers/serviceForm/General';
import MetadataStore from '../../../../../../src/js/stores/MetadataStore';
import ValidatorUtil from '../../../../../../src/js/utils/ValidatorUtil';

const {MESOS, DOCKER, NONE} = ContainerConstants.type;

const METHODS_TO_BIND = [
  'handleConvertToPod',
  'handleCloseConvertToPodModal',
  'handleOpenConvertToPodModal'
];

const containerRuntimes = {
  [NONE]: {
    label: <span>Mesos Runtime</span>,
    helpText: 'Normal behaviour'
  },
  [MESOS]: {
    label: <span>Universal Container Runtime</span>,
    helpText: 'Native container engine in Mesos using standard Linux features. Supports multiple containers (Pods) and GPU resources.'
  },
  [DOCKER]: {
    label: <span>Docker Engine <em>(recommended)</em></span>,
    helpText: 'Docker’s container runtime. No support for multiple containers (Pods) or GPU resources.'
  }
};

class GeneralServiceFormSection extends Component {
  constructor() {
    super(...arguments);

    this.state = {convertToPodModalOpen: false};

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleConvertToPod() {
    this.props.onConvertToPod();
    this.handleCloseConvertToPodModal();
  }

  handleCloseConvertToPodModal() {
    this.setState({convertToPodModalOpen: false});
  }

  handleOpenConvertToPodModal() {
    this.setState({convertToPodModalOpen: true});
  }

  getContainerSection() {
    let {data = {}, errors} = this.props;

    if (!(this.props.service instanceof Pod)) {
      return (
        <ContainerServiceFormSection
          data={data}
          errors={errors.container}
          onAddItem={this.props.onAddItem}
          onRemoveItem={this.props.onRemoveItem} />
      );
    }

    let {containers = []} = data;
    return containers.map((item, index) => {
      return (
        <div key={index}>
          {item.name || `container ${index + 1}`}
          <a className="button button-primary-link"
            onClick={this.props.onRemoveItem.bind(this, {value: index, path: 'containers'})}>
            Delete
          </a>
        </div>
      );
    });
  }

  getConvertToPodAction() {
    let {service, isEdit} = this.props;

    if (isEdit || service instanceof Pod) {
      return null;
    }

    return (
      <p>
        Need to run a service with multiple containers?
        <a onClick={this.handleOpenConvertToPodModal}>
          Add another container
        </a>.
      </p>
    );
  }
  getMultiContainerSection() {
    let {service} = this.props;
    if (!(service instanceof Pod)) {
      return null;
    }

    return (
        <div>
          <a
            className="button button-primary-link button-flush"
            onClick={this.props.onAddItem.bind(this, {value: 0, path: 'containers'})}>
            + Add Container
          </a>
        </div>
    );
  }

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
          <div key={index} className="flex row">
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
        </div>
      );
    });
  }

  getRuntimeSection() {
    let {errors, service, data} = this.props;
    if (service instanceof Pod) {
      return null;
    }

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
      <h3 className="short-top short-bottom">
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
    </div>
    );
  }

  getRuntimeSelections() {
    let {data = {}} = this.props;
    let {container = {}, gpus} = data;
    let isDisabled = {};
    let disabledTooltipContent;
    let type = NONE;

    if (container != null && container.type != null) {
      type = container.type;
    }

    if (!ValidatorUtil.isEmpty(gpus)) {
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
          </div>

          {this.getRuntimeSection()}

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
              <div>
                <a
                    className="button button-primary-link button-flush"
                    onClick={this.props.onAddItem.bind(this, {value: data.constraints.length, path: 'constraints'})}>
                  + Add Placement Constraint
                </a>
              </div>
            </AdvancedSectionContent>
          </AdvancedSection>

          {this.getContainerSection()}
          {this.getMultiContainerSection()}
          {this.getConvertToPodAction()}

          <Confirm
              closeByBackdropClick={true}
              header="Switching to a pod service"
              open={this.state.convertToPodModalOpen}
              onClose={this.handleCloseConvertToPodModal}
              leftButtonText="Close"
              leftButtonCallback={this.handleCloseConvertToPodModal}
              rightButtonText="Continue"
              rightButtonClassName="button button-success"
              rightButtonCallback={this.handleConvertToPod}
              showHeader={true}>
            <p>
              {'Adding another container will automatically put multiple containers into a Pod definition. Your containers will be co-located on the same node and scale together. '}
              <a href={MetadataStore.buildDocsURI('/usage/pods/')} target="_blank">More information</a>.
            </p>
            <p>Are you sure you would like to continue and create a Pod? Any data you have already entered will be lost.</p>
          </Confirm>
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

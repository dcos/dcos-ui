import classNames from "classnames";
import React, { Component } from "react";
import { Confirm, Tooltip } from "reactjs-components";

import {
  findNestedPropertyInObject
} from "../../../../../../src/js/utils/Util";
import { pluralize } from "../../../../../../src/js/utils/StringUtil";
import AddButton from "../../../../../../src/js/components/form/AddButton";
import AdvancedSection
  from "../../../../../../src/js/components/form/AdvancedSection";
import AdvancedSectionContent
  from "../../../../../../src/js/components/form/AdvancedSectionContent";
import AdvancedSectionLabel
  from "../../../../../../src/js/components/form/AdvancedSectionLabel";
import ContainerConstants from "../../constants/ContainerConstants";
import ContainerServiceFormSection from "./ContainerServiceFormSection";
import ContainerServiceFormAdvancedSection
  from "./ContainerServiceFormAdvancedSection";
import DeleteRowButton
  from "../../../../../../src/js/components/form/DeleteRowButton";
import FieldError from "../../../../../../src/js/components/form/FieldError";
import FieldHelp from "../../../../../../src/js/components/form/FieldHelp";
import FieldInput from "../../../../../../src/js/components/form/FieldInput";
import FieldLabel from "../../../../../../src/js/components/form/FieldLabel";
import FieldSelect from "../../../../../../src/js/components/form/FieldSelect";
import FormGroup from "../../../../../../src/js/components/form/FormGroup";
import FormGroupHeading
  from "../../../../../../src/js/components/form/FormGroupHeading";
import FormGroupHeadingContent
  from "../../../../../../src/js/components/form/FormGroupHeadingContent";
import FormRow from "../../../../../../src/js/components/form/FormRow";
import FormGroupContainer
  from "../../../../../../src/js/components/form/FormGroupContainer";
import General from "../../reducers/serviceForm/General";
import ModalHeading
  from "../../../../../../src/js/components/modals/ModalHeading";
import OperatorTypes from "../../constants/OperatorTypes";
import PlacementConstraintsUtil from "../../utils/PlacementConstraintsUtil";
import PodSpec from "../../structs/PodSpec";
import Icon from "../../../../../../src/js/components/Icon";
import MetadataStore from "../../../../../../src/js/stores/MetadataStore";
import { isEmpty } from "../../../../../../src/js/utils/ValidatorUtil";

const { type: { MESOS, DOCKER, NONE }, labelMap } = ContainerConstants;

const METHODS_TO_BIND = [
  "handleConvertToPod",
  "handleCloseConvertToPodModal",
  "handleOpenConvertToPodModal"
];

const containerRuntimes = {
  [DOCKER]: {
    label: <span>{labelMap[DOCKER]}</span>,
    helpText: "Docker’s container runtime. No support for multiple containers (Pods) or GPU resources."
  },
  [NONE]: {
    label: <span>{labelMap[NONE]}</span>,
    helpText: "The default Mesos containerizer"
  },
  [MESOS]: {
    label: <span>{labelMap[MESOS]}</span>,
    helpText: "Native container engine in Mesos using standard Linux features. Supports Docker file format, multiple containers (Pods) and GPU resources."
  }
};

function placementConstraintLabel(name, tooltipText, options = {}) {
  const { isRequired = false, linkText = "More information" } = options;

  const tooltipContent = (
    <span>
      {`${tooltipText} `}
      <a
        href="https://mesosphere.github.io/marathon/docs/constraints.html"
        target="_blank"
      >
        {linkText}
      </a>.
    </span>
  );

  return (
    <FieldLabel>
      <FormGroupHeading required={isRequired}>
        <FormGroupHeadingContent primary={true}>
          {name}
        </FormGroupHeadingContent>
        <FormGroupHeadingContent>
          <Tooltip
            content={tooltipContent}
            interactive={true}
            maxWidth={300}
            scrollContainer=".gm-scroll-view"
            wrapText={true}
          >
            <Icon color="grey" id="circle-question" size="mini" />
          </Tooltip>
        </FormGroupHeadingContent>
      </FormGroupHeading>
    </FieldLabel>
  );
}

class GeneralServiceFormSection extends Component {
  constructor() {
    super(...arguments);

    this.state = { convertToPodModalOpen: false };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  handleConvertToPod() {
    this.props.onConvertToPod();
    this.handleCloseConvertToPodModal();
  }

  handleCloseConvertToPodModal() {
    this.setState({ convertToPodModalOpen: false });
  }

  handleOpenConvertToPodModal() {
    this.setState({ convertToPodModalOpen: true });
  }

  getAdvancedContainerSection() {
    const { data = {}, errors, service } = this.props;

    if (service instanceof PodSpec) {
      return null;
    }

    return (
      <ContainerServiceFormAdvancedSection
        data={data}
        errors={errors}
        onAddItem={this.props.onAddItem}
        onRemoveItem={this.props.onRemoveItem}
        path="container"
        service={service}
      />
    );
  }

  getContainerSection() {
    const { data = {}, errors, service } = this.props;

    if (service instanceof PodSpec) {
      return null;
    }

    return (
      <ContainerServiceFormSection
        data={data}
        errors={errors}
        onAddItem={this.props.onAddItem}
        onRemoveItem={this.props.onRemoveItem}
        path="container"
        service={service}
      />
    );
  }

  getConvertToPodAction() {
    const { service, isEdit } = this.props;

    if (isEdit || service instanceof PodSpec) {
      return null;
    }

    return (
      <div className="pod pod-short flush-horizontal flush-bottom">
        <em>
          {"Need to run a service with multiple containers? "}
          <a className="clickable" onClick={this.handleOpenConvertToPodModal}>
            Add another container
          </a>.
        </em>
      </div>
    );
  }

  getMultiContainerSection() {
    const { data = {}, service } = this.props;
    if (!(service instanceof PodSpec)) {
      return null;
    }

    const { containers = [] } = data;
    const containerElements = containers.map((item, index) => {
      return (
        <FormGroupContainer
          key={index}
          onRemove={this.props.onRemoveItem.bind(this, {
            value: index,
            path: "containers"
          })}
        >
          {item.name || `container-${index + 1}`}
        </FormGroupContainer>
      );
    });

    return (
      <div>
        <h3 className="short-bottom">
          Containers
        </h3>
        {containerElements}
        <AddButton
          onClick={this.props.onAddItem.bind(this, {
            value: 0,
            path: "containers"
          })}
        >
          Add Container
        </AddButton>
      </div>
    );
  }

  getOperatorTypes() {
    return Object.keys(OperatorTypes).map((type, index) => {
      return <option key={index} value={type}>{type}</option>;
    });
  }

  getPlacementconstraints() {
    const { data = {} } = this.props;
    const constraintsErrors = findNestedPropertyInObject(
      this.props.errors,
      "constraints"
    );
    let errorNode = null;
    const placementTooltipContent = (
      <span>
        {
          "Constraints have three parts: a field name, an operator, and an optional parameter. The field can be the hostname of the agent node or any attribute of the agent node. "
        }
        <a
          href="https://mesosphere.github.io/marathon/docs/constraints.html"
          target="_blank"
        >
          More information
        </a>.
      </span>
    );
    const hasErrors =
      constraintsErrors != null && !Array.isArray(constraintsErrors);

    if (hasErrors) {
      errorNode = (
        <FormGroup showError={hasErrors}>
          <FieldError>
            {constraintsErrors}
          </FieldError>
        </FormGroup>
      );
    }

    return (
      <div>
        <h3 className="short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Placement Constraints
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={placementTooltipContent}
                interactive={true}
                maxWidth={300}
                scrollContainer=".gm-scroll-view"
                wrapText={true}
              >
                <Icon color="grey" id="circle-question" size="mini" />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h3>
        <p>
          Constraints control where apps run to allow optimization for either fault tolerance or locality.
        </p>
        {this.getPlacementConstraintsFields(data.constraints)}
        {errorNode}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton
              onClick={this.props.onAddItem.bind(this, {
                value: data.constraints.length,
                path: "constraints"
              })}
            >
              Add Placement Constraint
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }

  getPlacementConstraintsFields(data = []) {
    const constraintsErrors = findNestedPropertyInObject(
      this.props.errors,
      "constraints"
    );
    const hasOneRequiredValue = data.some(function(constraint) {
      return PlacementConstraintsUtil.requiresValue(constraint.operator);
    });
    const hideValueColumn = data.every(function(constraint) {
      return PlacementConstraintsUtil.requiresEmptyValue(constraint.operator);
    });

    return data.map((constraint, index) => {
      let fieldLabel = null;
      let operatorLabel = null;
      let valueLabel = null;
      const valueIsRequired = PlacementConstraintsUtil.requiresValue(
        constraint.operator
      );
      const valueIsRequiredEmpty = PlacementConstraintsUtil.requiresEmptyValue(
        constraint.operator
      );
      const fieldNameError = findNestedPropertyInObject(
        constraintsErrors,
        `${index}.fieldName`
      );
      const operatorError = findNestedPropertyInObject(
        constraintsErrors,
        `${index}.operator`
      );
      const valueError = findNestedPropertyInObject(
        constraintsErrors,
        `${index}.value`
      );
      const commonFieldsClassNames = {
        "column-4": !hideValueColumn,
        "column-6": hideValueColumn
      };
      const deleteRowButtonClassNames = classNames("column-2 flush-left", {
        "form-group-without-top-label": index === 0
      });

      if (index === 0) {
        fieldLabel = placementConstraintLabel(
          "Field",
          "If you enter `hostname`, the constraint will map to the agent node hostname. If you do not enter an agent node hostname, the field will be treated as a Mesos agent node attribute, which allows you to tag an agent node.",
          { isRequired: true }
        );
        operatorLabel = placementConstraintLabel(
          "Operator",
          "Operators specify where your app will run.",
          { isRequired: true }
        );
      }
      if (index === 0 && !hideValueColumn) {
        valueLabel = placementConstraintLabel(
          "Value",
          "Values allow you to further specify your constraint.",
          { linkText: "Learn more", isRequired: hasOneRequiredValue }
        );
      }

      return (
        <FormRow key={index}>
          <FormGroup
            className={commonFieldsClassNames}
            required={true}
            showError={Boolean(fieldNameError)}
          >
            {fieldLabel}
            <FieldInput
              name={`constraints.${index}.fieldName`}
              type="text"
              placeholer="hostname"
              value={constraint.fieldName}
            />
            <FieldError>{fieldNameError}</FieldError>
          </FormGroup>
          <FormGroup
            className={commonFieldsClassNames}
            required={true}
            showError={Boolean(operatorError)}
          >
            {operatorLabel}
            <FieldSelect
              name={`constraints.${index}.operator`}
              type="text"
              value={String(constraint.operator)}
            >
              <option value="">Select</option>
              {this.getOperatorTypes()}
            </FieldSelect>
            <FieldError>{operatorError}</FieldError>
          </FormGroup>
          <FormGroup
            className={{
              "column-4": !hideValueColumn,
              hidden: hideValueColumn
            }}
            required={valueIsRequired}
            showError={Boolean(valueError)}
          >
            {valueLabel}
            <FieldInput
              className={{ hidden: valueIsRequiredEmpty }}
              name={`constraints.${index}.value`}
              type="text"
              value={constraint.value}
            />
            <FieldHelp
              className={{ hidden: valueIsRequired || valueIsRequiredEmpty }}
            >
              This field is optional
            </FieldHelp>
            <FieldError className={{ hidden: hideValueColumn }}>
              {valueError}
            </FieldError>
          </FormGroup>

          <FormGroup className={deleteRowButtonClassNames}>
            <DeleteRowButton
              onClick={this.props.onRemoveItem.bind(this, {
                value: index,
                path: "constraints"
              })}
            />
          </FormGroup>
        </FormRow>
      );
    });
  }

  getRuntimeSection() {
    const { errors, service, data } = this.props;
    if (service instanceof PodSpec) {
      return null;
    }

    const typeErrors = findNestedPropertyInObject(errors, "container.type");
    const runtimeTooltipContent = (
      <span>
        {
          "You can run Docker containers with both container runtimes. The Universal Container Runtime is better supported in DC/OS. "
        }
        <a
          href={MetadataStore.buildDocsURI("/usage/containerizers/")}
          target="_blank"
        >
          More information
        </a>.
      </span>
    );

    return (
      <div>
        <h3 className="short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Container Runtime
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={runtimeTooltipContent}
                interactive={true}
                maxWidth={300}
                scrollContainer=".gm-scroll-view"
                wrapText={true}
              >
                <Icon color="grey" id="circle-question" size="mini" />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h3>
        <p>
          The container runtime is responsible for running your service. We
          support the Mesos and Docker containerizers.
        </p>
        <FormGroup showError={Boolean(typeErrors)}>
          {this.getRuntimeSelections(data)}
          <FieldError>{typeErrors}</FieldError>
        </FormGroup>
      </div>
    );
  }

  getRuntimeSelections() {
    const { data = {} } = this.props;
    const { container = {}, gpus } = data;
    const isDisabled = {};
    let disabledTooltipContent;
    let type = NONE;

    if (container != null && container.type != null) {
      type = container.type;
    }

    if (!isEmpty(gpus) && gpus !== 0) {
      isDisabled[DOCKER] = true;
      disabledTooltipContent =
        "Docker Engine does not support GPU resources, please select Universal Container Runtime if you want to use GPU resources.";
    }

    return Object.keys(containerRuntimes).map((runtimeName, index) => {
      const { helpText, label } = containerRuntimes[runtimeName];
      let field = (
        <FieldLabel className="text-align-left" key={index}>
          <FieldInput
            checked={Boolean(type === runtimeName)}
            disabled={isDisabled[runtimeName]}
            name="container.type"
            type="radio"
            value={runtimeName}
          />
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
            wrapText={true}
          >
            {field}
          </Tooltip>
        );
      }

      return field;
    });
  }

  shouldShowAdvancedOptions() {
    const { data, data: { container } } = this.props;
    const { docker } = container || {};

    return (
      !isEmpty(data.disk) ||
      !isEmpty(data.gpus) ||
      !isEmpty(data.constraints) ||
      !isEmpty(findNestedPropertyInObject(docker, "forcePullImage")) ||
      !isEmpty(findNestedPropertyInObject(docker, "image")) ||
      !isEmpty(findNestedPropertyInObject(docker, "privileged")) ||
      findNestedPropertyInObject(container, "type") !== DOCKER
    );
  }

  render() {
    const { data, errors } = this.props;
    const initialIsExpanded = this.shouldShowAdvancedOptions();
    const title = pluralize(
      "Service",
      findNestedPropertyInObject(data, "containers.length") || 1
    );

    const idTooltipContent = (
      <span>
        {
          "Include the path to your service, if applicable. E.g. /dev/tools/my-service. "
        }
        <a
          href="https://mesosphere.github.io/marathon/docs/application-groups.html"
          target="_blank"
        >
          More information
        </a>.
      </span>
    );

    return (
      <div>
        <h2 className="flush-top short-bottom">
          {title}
        </h2>
        <p>
          Configure your service below. Start by giving your service an ID.
        </p>

        <FormRow>
          <FormGroup className="column-9" showError={Boolean(errors.id)}>
            <FieldLabel>
              <FormGroupHeading required={true}>
                <FormGroupHeadingContent primary={true}>
                  Service ID
                </FormGroupHeadingContent>
                <FormGroupHeadingContent>
                  <Tooltip
                    content={idTooltipContent}
                    interactive={true}
                    maxWidth={300}
                    scrollContainer=".gm-scroll-view"
                    wrapText={true}
                  >
                    <Icon color="grey" id="circle-question" size="mini" />
                  </Tooltip>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldInput name="id" type="text" value={data.id} />
            <FieldHelp>
              Give your service a unique name within the cluster, e.g. my-service.
            </FieldHelp>
            <FieldError>{errors.id}</FieldError>
          </FormGroup>

          <FormGroup className="column-3" showError={Boolean(errors.instances)}>
            <FieldLabel>
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  Instances
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldInput
              name="instances"
              min={0}
              type="number"
              value={data.instances}
            />
            <FieldError>{errors.instances}</FieldError>
          </FormGroup>
        </FormRow>

        {this.getContainerSection()}

        <AdvancedSection initialIsExpanded={initialIsExpanded}>
          <AdvancedSectionLabel>
            More Settings
          </AdvancedSectionLabel>
          <AdvancedSectionContent>
            {this.getRuntimeSection()}
            {this.getPlacementconstraints()}
            {this.getAdvancedContainerSection()}
          </AdvancedSectionContent>
        </AdvancedSection>

        {this.getMultiContainerSection()}
        {this.getConvertToPodAction()}

        <Confirm
          closeByBackdropClick={true}
          header={<ModalHeading>Switching to a pod service</ModalHeading>}
          open={this.state.convertToPodModalOpen}
          onClose={this.handleCloseConvertToPodModal}
          leftButtonText="Close"
          leftButtonCallback={this.handleCloseConvertToPodModal}
          rightButtonText="Continue"
          rightButtonClassName="button button-success"
          rightButtonCallback={this.handleConvertToPod}
          showHeader={true}
        >
          <p>
            {
              "Adding another container will automatically put multiple containers into a Pod definition. Your containers will be co-located on the same node and scale together. "
            }
            <a
              href={MetadataStore.buildDocsURI("/usage/pods/")}
              target="_blank"
            >
              More information
            </a>.
          </p>
          <p>
            Are you sure you would like to continue and create a Pod? Any data you have already entered will be lost.
          </p>
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

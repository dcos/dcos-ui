import PropTypes from "prop-types";
import React, { Component } from "react";
import { Confirm, Tooltip } from "reactjs-components";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { isEmpty } from "#SRC/js/utils/ValidatorUtil";
import { pluralize } from "#SRC/js/utils/StringUtil";
import AddButton from "#SRC/js/components/form/AddButton";
import AdvancedSection from "#SRC/js/components/form/AdvancedSection";
import AdvancedSectionContent
  from "#SRC/js/components/form/AdvancedSectionContent";
import AdvancedSectionLabel from "#SRC/js/components/form/AdvancedSectionLabel";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldError from "#SRC/js/components/form/FieldError";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupContainer from "#SRC/js/components/form/FormGroupContainer";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent
  from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";
import Icon from "#SRC/js/components/Icon";
import MetadataStore from "#SRC/js/stores/MetadataStore";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";

import ContainerConstants from "../../constants/ContainerConstants";
import ContainerServiceFormSection from "./ContainerServiceFormSection";
import ContainerServiceFormAdvancedSection
  from "./ContainerServiceFormAdvancedSection";
import General from "../../reducers/serviceForm/General";
import PodSpec from "../../structs/PodSpec";

const { type: { MESOS, DOCKER }, labelMap } = ContainerConstants;

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
  [MESOS]: {
    label: <span>{labelMap[MESOS]}</span>,
    helpText: "Universal Container Runtime using native Mesos engine. Supports Docker file format, multiple containers (Pods) and GPU resources."
  }
};

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

  getAdvancedSettingsSection() {
    const { data = {}, errors, service } = this.props;

    if (service instanceof PodSpec) {
      return null;
    }

    const initialIsExpanded = this.shouldShowAdvancedOptions();

    return (
      <AdvancedSection initialIsExpanded={initialIsExpanded}>
        <AdvancedSectionLabel>
          More Settings
        </AdvancedSectionLabel>
        <AdvancedSectionContent>
          {this.getRuntimeSection()}
          <ContainerServiceFormAdvancedSection
            data={data}
            errors={errors}
            onAddItem={this.props.onAddItem}
            onRemoveItem={this.props.onRemoveItem}
            path="container"
            service={service}
          />
        </AdvancedSectionContent>
      </AdvancedSection>
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
          onClick={this.props.onClickItem.bind(this, `container${index}`)}
        >
          {item.name || `container-${index + 1}`}
        </FormGroupContainer>
      );
    });

    return (
      <div>
        <h2 className="short-bottom">
          Containers
        </h2>
        {containerElements}
        <AddButton
          onClick={this.props.onAddItem.bind(this, {
            path: "containers"
          })}
        >
          Add Container
        </AddButton>
      </div>
    );
  }

  getRuntimeSection() {
    const { errors, data } = this.props;

    const typeErrors = findNestedPropertyInObject(errors, "container.type");
    const runtimeTooltipContent = (
      <span>
        {
          "You can run Docker containers with both container runtimes. The Universal Container Runtime (UCR) is better supported in DC/OS. "
        }
        <a
          href={MetadataStore.buildDocsURI(
            "/deploying-services/containerizers/"
          )}
          target="_blank"
        >
          More information
        </a>.
      </span>
    );

    return (
      <div>
        <h2 className="short-bottom">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Container Runtime
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={runtimeTooltipContent}
                interactive={true}
                maxWidth={300}
                wrapText={true}
              >
                <Icon color="light-grey" id="circle-question" size="mini" />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </h2>
        <p>
          The container runtime is responsible for running your service. We
          support the Docker Engine and Universal Container Runtime (UCR).
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
    let type = MESOS;

    if (container != null && container.type != null) {
      type = container.type;
    }

    if (!isEmpty(gpus) && gpus !== 0) {
      isDisabled[DOCKER] = true;
      disabledTooltipContent =
        "Docker Engine does not support GPU resources, please select Universal Container Runtime (UCR) if you want to use GPU resources.";
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
          href={MetadataStore.buildDocsURI(
            "/deploying-services/creating-services/"
          )}
          target="_blank"
        >
          More information
        </a>.
      </span>
    );

    const isEditPage = /\/edit\//g.test(global.location.hash);

    return (
      <div>
        <h1 className="flush-top short-bottom">
          {title}
        </h1>
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
                    wrapText={true}
                  >
                    <Icon color="light-grey" id="circle-question" size="mini" />
                  </Tooltip>
                </FormGroupHeadingContent>
              </FormGroupHeading>
            </FieldLabel>
            <FieldAutofocus>
              <FieldInput
                name="id"
                type="text"
                value={data.id}
                disabled={isEditPage}
              />
            </FieldAutofocus>
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
        {this.getAdvancedSettingsSection()}
        {this.getMultiContainerSection()}
        {this.getConvertToPodAction()}

        <Confirm
          closeByBackdropClick={true}
          header={<ModalHeading>Switching to a pod service</ModalHeading>}
          open={this.state.convertToPodModalOpen}
          onClose={this.handleCloseConvertToPodModal}
          leftButtonText="Cancel"
          leftButtonClassName="button button-primary-link"
          leftButtonCallback={this.handleCloseConvertToPodModal}
          rightButtonText="Switch to Pod"
          rightButtonClassName="button button-primary"
          rightButtonCallback={this.handleConvertToPod}
          showHeader={true}
        >
          <p>
            {
              "Adding another container will automatically put multiple containers into a Pod definition. Your containers will be co-located on the same node and scale together. "
            }
            <a
              href={MetadataStore.buildDocsURI("/deploying-services/pods/")}
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
  data: PropTypes.object,
  errors: PropTypes.object,
  onAddItem: PropTypes.func,
  onRemoveItem: PropTypes.func,
  onClickItem: PropTypes.func
};

GeneralServiceFormSection.configReducers = General;

module.exports = GeneralServiceFormSection;

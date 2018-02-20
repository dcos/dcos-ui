import classNames from "classnames";
import deepEqual from "deep-equal";
import { MountService } from "foundation-ui";
import PropTypes from "prop-types";
import React, { Component } from "react";

import { deepCopy, findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { pluralize } from "#SRC/js/utils/StringUtil";
import AdvancedSection from "#SRC/js/components/form/AdvancedSection";
import AdvancedSectionContent
  from "#SRC/js/components/form/AdvancedSectionContent";
import AdvancedSectionLabel from "#SRC/js/components/form/AdvancedSectionLabel";
import Batch from "#SRC/js/structs/Batch";
import DataValidatorUtil from "#SRC/js/utils/DataValidatorUtil";
import ErrorMessageUtil from "#SRC/js/utils/ErrorMessageUtil";
import ErrorsAlert from "#SRC/js/components/ErrorsAlert";
import FluidGeminiScrollbar from "#SRC/js/components/FluidGeminiScrollbar";
import JSONEditor from "#SRC/js/components/JSONEditor";
import PageHeaderNavigationDropdown
  from "#SRC/js/components/PageHeaderNavigationDropdown";
import TabButton from "#SRC/js/components/TabButton";
import TabButtonList from "#SRC/js/components/TabButtonList";
import Tabs from "#SRC/js/components/Tabs";
import TabView from "#SRC/js/components/TabView";
import TabViewList from "#SRC/js/components/TabViewList";
import Transaction from "#SRC/js/structs/Transaction";
import TransactionTypes from "#SRC/js/constants/TransactionTypes";

import { getContainerNameWithIcon } from "../../utils/ServiceConfigDisplayUtil";
import ArtifactsSection from "../forms/ArtifactsSection";
import ContainerServiceFormSection from "../forms/ContainerServiceFormSection";
import CreateServiceModalFormUtil from "../../utils/CreateServiceModalFormUtil";
import EnvironmentFormSection from "../forms/EnvironmentFormSection";
import GeneralServiceFormSection from "../forms/GeneralServiceFormSection";
import HealthChecksFormSection from "../forms/HealthChecksFormSection";
import MultiContainerHealthChecksFormSection
  from "../forms/MultiContainerHealthChecksFormSection";
import MultiContainerNetworkingFormSection
  from "../forms/MultiContainerNetworkingFormSection";
import MultiContainerVolumesFormSection
  from "../forms/MultiContainerVolumesFormSection";
import MultiContainerFormAdvancedSection
  from "../forms/MultiContainerFormAdvancedSection";
import PlacementSection from "../forms/PlacementSection";
import NetworkingFormSection from "../forms/NetworkingFormSection";
import PodSpec from "../../structs/PodSpec";
import ServiceErrorMessages from "../../constants/ServiceErrorMessages";
import ServiceErrorPathMapping from "../../constants/ServiceErrorPathMapping";
import ServiceUtil from "../../utils/ServiceUtil";
import VolumesFormSection from "../forms/VolumesFormSection";

const METHODS_TO_BIND = [
  "getNewStateForJSON",
  "handleAddItem",
  "handleConvertToPod",
  "handleDropdownNavigationSelection",
  "handleFormBlur",
  "handleFormFocus",
  "handleFormChange",
  "handleJSONChange",
  "handleJSONPropertyChange",
  "handleRemoveItem",
  "handleClickItem"
];

/**
 * Since the form input fields operate on a different path than the one in the
 * data, it's not always possible to figure out which error paths to unmute when
 * the field is edited. Therefore, form fields that do not map 1:1 with the data
 * are opted out from the error muting feature.
 *
 * TODO: This should be removed when DCOS-13524 is completed
 */
const CONSTANTLY_UNMUTED_ERRORS = [
  /^constraints\.[0-9]+\./,
  /^portDefinitions\.[0-9]+\./,
  /^container.docker.portMappings\.[0-9]+\./,
  /^volumes\.[0-9]+\./
];

class CreateServiceModalForm extends Component {
  constructor() {
    super(...arguments);

    // Hint: When you add something to the state, make sure to update the
    //       shouldComponentUpdate function, since we are trying to reduce
    //       the number of updates as much as possible.
    // In the Next line we are destructing the config to keep labels as it is and even keep labels with an empty value
    const { labels = {}, ...serviceConfig } = ServiceUtil.getServiceJSON(
      this.props.service
    );

    let newServiceConfig = {
      labels,
      ...CreateServiceModalFormUtil.stripEmptyProperties(serviceConfig)
    };
    if (Object.keys(labels).length === 0) {
      newServiceConfig = CreateServiceModalFormUtil.stripEmptyProperties(
        serviceConfig
      );
    }
    this.state = Object.assign(
      {
        appConfig: null,
        batch: new Batch(),
        baseConfig: {},
        editedFieldPaths: [],
        editingFieldPath: null,
        isPod: false,
        jsonReducer() {},
        jsonParser() {}
      },
      this.getNewStateForJSON(
        newServiceConfig,
        this.props.service instanceof PodSpec
      )
    );

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(nextProps) {
    const prevJSON = ServiceUtil.getServiceJSON(this.props.service);
    const nextJSON = ServiceUtil.getServiceJSON(nextProps.service);
    const isPod = nextProps.service instanceof PodSpec;

    // Note: We ignore changes that might derive from the `onChange` event
    // handler. In that case the contents of nextJSON would be the same
    // as the contents of the last rendered appConfig in the state.
    if (
      this.state.isPod !== isPod ||
      (!deepEqual(prevJSON, nextJSON) &&
        !deepEqual(this.state.appConfig, nextJSON) &&
        !deepEqual(this.props.errors, nextProps.errors))
    ) {
      this.setState(this.getNewStateForJSON(nextJSON, isPod));
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { editingFieldPath, appConfig } = this.state;
    const { onChange, service } = this.props;

    const shouldUpdate =
      editingFieldPath === null &&
      (prevState.editingFieldPath !== null ||
        !deepEqual(appConfig, prevState.appConfig));
    if (shouldUpdate) {
      onChange(new service.constructor(appConfig));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Update if json state changed
    if (this.props.isJSONModeActive !== nextProps.isJSONModeActive) {
      return true;
    }

    // Update if showAllErrors changed
    if (this.props.showAllErrors !== nextProps.showAllErrors) {
      return true;
    }

    // Update if pod type changed
    if (this.state.isPod !== nextProps.service instanceof PodSpec) {
      return true;
    }

    // Update if service property has changed
    //
    // Note: We ignore changes that might derrive from the `onChange` event
    // handler. In that case the contents of nextJSON would be the same
    // as the contents of the last rendered appConfig in the state.
    //
    const prevJSON = ServiceUtil.getServiceJSON(this.props.service);
    const nextJSON = ServiceUtil.getServiceJSON(nextProps.service);
    if (
      !deepEqual(prevJSON, nextJSON) &&
      !deepEqual(this.state.appConfig, nextJSON)
    ) {
      return true;
    }

    const didBaseConfigChange = this.state.baseConfig !== nextState.baseConfig;
    const didBatchChange = this.state.batch !== nextState.batch;
    const didEditingFieldPathChange =
      this.state.editingFieldPath !== nextState.editingFieldPath;
    const didActiveTabChange = this.props.activeTab !== nextProps.activeTab;

    // Otherwise update if the state has changed
    return (
      didBaseConfigChange ||
      didBatchChange ||
      didEditingFieldPathChange ||
      didActiveTabChange ||
      !deepEqual(this.props.errors, nextProps.errors)
    );
  }

  getNewStateForJSON(baseConfig = {}, isPod = this.state.isPod) {
    const newState = {
      baseConfig,
      isPod
    };

    // Regenerate batch
    newState.batch = this.props
      .jsonParserReducers(deepCopy(baseConfig))
      .reduce((batch, item) => {
        return batch.add(item);
      }, new Batch());

    // Update appConfig
    newState.appConfig = this.getAppConfig(newState.batch, baseConfig);

    return newState;
  }

  handleConvertToPod() {
    this.props.onConvertToPod(this.getAppConfig());
  }

  handleDropdownNavigationSelection(item) {
    this.props.handleTabChange(item.id);
  }

  handleJSONChange(jsonObject) {
    this.setState(this.getNewStateForJSON(jsonObject));
  }

  handleJSONPropertyChange(path) {
    const { editedFieldPaths } = this.state;
    const pathStr = path.join(".");
    if (path.length === 0) {
      return;
    }

    if (!editedFieldPaths.includes(pathStr)) {
      this.setState({
        editedFieldPaths: editedFieldPaths.concat([pathStr])
      });
    }
  }

  handleFormBlur(event) {
    const { editedFieldPaths } = this.state;
    const fieldName = event.target.getAttribute("name");
    const newState = {
      editingFieldPath: null
    };

    if (!fieldName) {
      return;
    }

    // Keep track of which fields have changed
    if (!editedFieldPaths.includes(fieldName)) {
      newState.editedFieldPaths = editedFieldPaths.concat([fieldName]);
    }
    this.setState(newState);
  }

  handleFormFocus(event) {
    const fieldName = event.target.getAttribute("name");
    const newState = {
      editingFieldPath: fieldName
    };

    if (!fieldName) {
      return;
    }

    this.setState(newState);
  }

  handleFormChange(event) {
    const fieldName = event.target.getAttribute("name");
    if (!fieldName) {
      return;
    }

    let { batch } = this.state;
    let value = event.target.value;
    if (event.target.type === "checkbox") {
      value = event.target.checked;
    }
    const path = fieldName.split(".");
    batch = batch.add(new Transaction(path, value));

    const newState = {
      appConfig: this.getAppConfig(batch),
      batch
    };

    this.setState(newState);
  }

  handleAddItem(event) {
    const { value, path } = event;
    let { batch } = this.state;

    batch = batch.add(
      new Transaction(path.split("."), value, TransactionTypes.ADD_ITEM)
    );

    this.setState({ batch, appConfig: this.getAppConfig(batch) });
  }

  handleRemoveItem(event) {
    const { value, path } = event;
    let { batch } = this.state;

    batch = batch.add(
      new Transaction(path.split("."), value, TransactionTypes.REMOVE_ITEM)
    );

    this.setState({ batch, appConfig: this.getAppConfig(batch) });
  }

  handleClickItem(item) {
    this.props.handleTabChange(item);
  }

  getAppConfig(batch = this.state.batch, baseConfig = this.state.baseConfig) {
    // Do a deepCopy once before it goes to reducers
    // so they don't need to perform Object.assign()
    const baseConfigCopy = deepCopy(baseConfig);
    const newConfig = batch.reduce(
      this.props.jsonConfigReducers,
      baseConfigCopy
    );

    // In the Next line we are destructing the config to keep labels as it is and even keep labels with an empty value
    const { labels, ...config } = newConfig;

    if (Object.keys(labels).length === 0) {
      return CreateServiceModalFormUtil.stripEmptyProperties(config);
    }

    return {
      labels,
      ...CreateServiceModalFormUtil.stripEmptyProperties(config)
    };
  }

  getErrors() {
    return ErrorMessageUtil.translateErrorMessages(
      this.props.errors,
      ServiceErrorMessages
    );
  }

  getContainerList(data) {
    if (Array.isArray(data.containers) && data.containers.length !== 0) {
      return data.containers.map((item, index) => {
        const fakeContainer = { name: item.name || `container-${index + 1}` };

        return {
          className: "text-overflow",
          id: `container${index}`,
          label: getContainerNameWithIcon(fakeContainer)
        };
      });
    }

    return null;
  }

  getContainerContent(data, errors) {
    const { service, showAllErrors } = this.props;
    const { containers } = data;

    if (containers == null) {
      return [];
    }

    return containers.map((item, index) => {
      const artifactsPath = `containers.${index}.artifacts`;
      const artifacts = findNestedPropertyInObject(data, artifactsPath) || [];
      const artifactErrors = findNestedPropertyInObject(
        errors,
        artifactsPath
      ) || [];

      return (
        <TabView key={index} id={`container${index}`}>
          <ErrorsAlert
            errors={this.getErrors()}
            pathMapping={ServiceErrorPathMapping}
            hideTopLevelErrors={!showAllErrors}
          />
          <h1 className="flush-top short-bottom">
            Container
          </h1>
          <p>
            Configure your container below. Enter a container image or command you want to run.
          </p>
          <ContainerServiceFormSection
            data={data}
            errors={errors}
            onAddItem={this.handleAddItem}
            onRemoveItem={this.handleRemoveItem}
            path={`containers.${index}`}
            service={service}
          />

          <AdvancedSection>
            <AdvancedSectionLabel>
              More Settings
            </AdvancedSectionLabel>
            <AdvancedSectionContent>
              <MultiContainerFormAdvancedSection
                data={data}
                path={`containers.${index}`}
              />
              <ArtifactsSection
                data={artifacts}
                path={artifactsPath}
                errors={artifactErrors}
                onRemoveItem={this.handleRemoveItem}
                onAddItem={this.handleAddItem}
              />
            </AdvancedSectionContent>
          </AdvancedSection>
        </TabView>
      );
    });
  }

  getFormDropdownList(navigationItems, activeTab, options = {}) {
    const { isNested } = options;

    return navigationItems.reduce((accumulator, item, index) => {
      accumulator.push({
        className: classNames({ "page-header-menu-item-nested": isNested }),
        id: item.id,
        isActive: activeTab === item.id || (activeTab == null && index === 0),
        label: item.label
      });

      if (item.children) {
        accumulator = accumulator.concat(
          this.getFormDropdownList(item.children, activeTab, { isNested: true })
        );
      }

      return accumulator;
    }, []);
  }

  getFormNavigationItems(appConfig, data) {
    const serviceLabel = pluralize(
      "Service",
      findNestedPropertyInObject(appConfig, "containers.length") || 1
    );

    const tabList = [
      {
        id: "services",
        label: serviceLabel,
        children: this.getContainerList(data)
      }
    ];

    if (this.state.isPod) {
      tabList.push(
        { id: "placement", key: "placement", label: "Placement" },
        { id: "networking", key: "multinetworking", label: "Networking" },
        { id: "volumes", key: "multivolumes", label: "Volumes" },
        {
          id: "healthChecks",
          key: "multihealthChecks",
          label: "Health Checks"
        },
        { id: "environment", key: "multienvironment", label: "Environment" }
      );
    } else {
      tabList.push(
        { id: "placement", key: "placement", label: "Placement" },
        { id: "networking", key: "networking", label: "Networking" },
        { id: "volumes", key: "volumes", label: "Volumes" },
        { id: "healthChecks", key: "healthChecks", label: "Health Checks" },
        { id: "environment", key: "environment", label: "Environment" }
      );
    }

    return tabList;
  }

  getFormTabList(navigationItems) {
    if (navigationItems == null) {
      return null;
    }

    return navigationItems.map(item => {
      return (
        <TabButton
          className={item.className}
          id={item.id}
          label={item.label}
          key={item.key || item.id}
        >
          {this.getFormTabList(item.children)}
        </TabButton>
      );
    });
  }

  getSectionContent(data, errorMap) {
    const { showAllErrors } = this.props;
    const errors = this.getErrors();

    if (this.state.isPod) {
      return [
        <TabView id="placement" key="placement">
          <ErrorsAlert
            errors={errors}
            pathMapping={ServiceErrorPathMapping}
            hideTopLevelErrors={!showAllErrors}
          />
          <MountService.Mount
            type="CreateService:MultiContainerPlacementSection"
            data={data}
            errors={errorMap}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem}
            showAllErrors={showAllErrors}
          >
            <PlacementSection
              data={data}
              errors={errorMap}
              onRemoveItem={this.handleRemoveItem}
              onAddItem={this.handleAddItem}
              showAllErrors={showAllErrors}
            />
          </MountService.Mount>
        </TabView>,
        <TabView id="networking" key="multinetworking">
          <ErrorsAlert
            errors={errors}
            pathMapping={ServiceErrorPathMapping}
            hideTopLevelErrors={!showAllErrors}
          />
          <MultiContainerNetworkingFormSection
            data={data}
            errors={errorMap}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem}
          />
        </TabView>,
        <TabView id="volumes" key="multivolumes">
          <ErrorsAlert
            errors={errors}
            pathMapping={ServiceErrorPathMapping}
            hideTopLevelErrors={!showAllErrors}
          />
          <MultiContainerVolumesFormSection
            data={data}
            errors={errorMap}
            handleTabChange={this.props.handleTabChange}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem}
          />
        </TabView>,
        <TabView id="healthChecks" key="multihealthChecks">
          <ErrorsAlert
            errors={errors}
            pathMapping={ServiceErrorPathMapping}
            hideTopLevelErrors={!showAllErrors}
          />
          <MultiContainerHealthChecksFormSection
            data={data}
            errors={errorMap}
            handleTabChange={this.props.handleTabChange}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem}
          />
        </TabView>,
        <TabView id="environment" key="multienvironment">
          <ErrorsAlert
            errors={errors}
            pathMapping={ServiceErrorPathMapping}
            hideTopLevelErrors={!showAllErrors}
          />
          <EnvironmentFormSection
            mountType="CreateService:MultiContainerEnvironmentFormSection"
            data={data}
            errors={errorMap}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem}
          />
        </TabView>
      ];
    }

    return [
      <TabView id="placement" key="placement">
        <ErrorsAlert
          errors={errors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <MountService.Mount
          type="CreateService:PlacementSection"
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem}
          showAllErrors={showAllErrors}
        >
          <PlacementSection
            data={data}
            errors={errorMap}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem}
            showAllErrors={showAllErrors}
          />
        </MountService.Mount>
      </TabView>,
      <TabView id="networking" key="networking">
        <ErrorsAlert
          errors={errors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <NetworkingFormSection
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem}
        />
      </TabView>,
      <TabView id="volumes" key="volumes">
        <ErrorsAlert
          errors={errors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <VolumesFormSection
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem}
        />
      </TabView>,
      <TabView id="healthChecks" key="healthChecks">
        <ErrorsAlert
          errors={errors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <HealthChecksFormSection
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem}
        />
      </TabView>,
      <TabView id="environment" key="environment">
        <ErrorsAlert
          errors={errors}
          pathMapping={ServiceErrorPathMapping}
          hideTopLevelErrors={!showAllErrors}
        />
        <EnvironmentFormSection
          mountType="CreateService:EnvironmentFormSection"
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem}
        />
      </TabView>
    ];
  }

  /**
   * This function filters the error list in order to keep only the
   * errors that should be displayed to the UI.
   *
   * @returns {Array} - Returns an array of errors that passed the filter
   */
  getUnmutedErrors() {
    const { showAllErrors } = this.props;
    const { editedFieldPaths, editingFieldPath } = this.state;
    const errors = [].concat.apply([], this.getErrors());

    return errors.filter(function(error) {
      const errorPath = error.path.join(".");

      // Always mute the error on the field we are editing
      if (editingFieldPath != null && errorPath === editingFieldPath) {
        return false;
      }

      // Never mute fields in the CONSTANTLY_UNMUTED_ERRORS fields
      const isUnmuted = CONSTANTLY_UNMUTED_ERRORS.some(function(rule) {
        return rule.test(errorPath);
      });

      return isUnmuted || showAllErrors || editedFieldPaths.includes(errorPath);
    });
  }

  render() {
    const { appConfig, batch } = this.state;
    const {
      activeTab,
      handleTabChange,
      isEdit,
      isJSONModeActive,
      onConvertToPod,
      service,
      showAllErrors
    } = this.props;
    const data = batch.reduce(this.props.inputConfigReducers, {});
    const unmutedErrors = this.getUnmutedErrors();
    const errors = this.getErrors();

    const jsonEditorPlaceholderClasses = classNames(
      "modal-full-screen-side-panel-placeholder",
      { "is-visible": isJSONModeActive }
    );
    const jsonEditorClasses = classNames("modal-full-screen-side-panel", {
      "is-visible": isJSONModeActive
    });

    const errorMap = DataValidatorUtil.errorArrayToMap(unmutedErrors);
    const navigationItems = this.getFormNavigationItems(appConfig, data);
    const tabButtonListItems = this.getFormTabList(navigationItems);
    const navigationDropdownItems = this.getFormDropdownList(
      navigationItems,
      activeTab
    );

    return (
      <div className="flex flex-item-grow-1">
        <div className="create-service-modal-form__scrollbar-container modal-body-offset gm-scrollbar-container-flex">
          <PageHeaderNavigationDropdown
            handleNavigationItemSelection={
              this.handleDropdownNavigationSelection
            }
            items={navigationDropdownItems}
          />
          <FluidGeminiScrollbar>
            <div className="modal-body-padding-surrogate create-service-modal-form-container">
              <form
                className="create-service-modal-form container"
                onChange={this.handleFormChange}
                onBlur={this.handleFormBlur}
                onFocus={this.handleFormFocus}
              >
                <Tabs
                  activeTab={activeTab}
                  handleTabChange={handleTabChange}
                  vertical={true}
                >
                  <TabButtonList>
                    {tabButtonListItems}
                  </TabButtonList>
                  <TabViewList>
                    <TabView id="services">
                      <ErrorsAlert
                        errors={errors}
                        pathMapping={ServiceErrorPathMapping}
                        hideTopLevelErrors={!showAllErrors}
                      />
                      <GeneralServiceFormSection
                        errors={errorMap}
                        data={data}
                        isEdit={isEdit}
                        onConvertToPod={onConvertToPod}
                        service={service}
                        onRemoveItem={(options, event) => {
                          event.stopPropagation();
                          this.handleRemoveItem(options);
                        }}
                        onClickItem={this.handleClickItem}
                        onAddItem={this.handleAddItem}
                      />
                    </TabView>

                    {this.getContainerContent(data, errorMap)}
                    {this.getSectionContent(data, errorMap)}
                  </TabViewList>
                </Tabs>
              </form>
            </div>
          </FluidGeminiScrollbar>
        </div>
        <div className={jsonEditorPlaceholderClasses} />
        <div className={jsonEditorClasses}>
          <JSONEditor
            errors={errors}
            onChange={this.handleJSONChange}
            onPropertyChange={this.handleJSONPropertyChange}
            showGutter={true}
            showPrintMargin={false}
            theme="monokai"
            height="100%"
            value={appConfig}
            width="100%"
          />
        </div>
      </div>
    );
  }
}

CreateServiceModalForm.defaultProps = {
  errors: [],
  handleTabChange() {},
  isJSONModeActive: false,
  onChange() {},
  onErrorStateChange() {},
  showAllErrors: false
};

CreateServiceModalForm.propTypes = {
  activeTab: PropTypes.string,
  errors: PropTypes.array,
  handleTabChange: PropTypes.func,
  isJSONModeActive: PropTypes.bool,
  onChange: PropTypes.func,
  onErrorStateChange: PropTypes.func,
  service: PropTypes.object,
  showAllErrors: PropTypes.bool
};

module.exports = CreateServiceModalForm;

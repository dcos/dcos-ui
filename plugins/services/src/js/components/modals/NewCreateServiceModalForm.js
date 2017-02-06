import classNames from 'classnames';
import deepEqual from 'deep-equal';
import React, {PropTypes, Component} from 'react';

import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import {getContainerNameWithIcon} from '../../utils/ServiceConfigDisplayUtil';
import {pluralize} from '../../../../../../src/js/utils/StringUtil';
import Alert from '../../../../../../src/js/components/Alert';
import Batch from '../../../../../../src/js/structs/Batch';
import ContainerServiceFormSection from '../forms/ContainerServiceFormSection';
import CreateServiceModalFormUtil from '../../utils/CreateServiceModalFormUtil';
import DataValidatorUtil from '../../../../../../src/js/utils/DataValidatorUtil';
import EnvironmentFormSection from '../forms/EnvironmentFormSection';
import ErrorMessageUtil from '../../../../../../src/js/utils/ErrorMessageUtil';
import FluidGeminiScrollbar from '../../../../../../src/js/components/FluidGeminiScrollbar';
import GeneralServiceFormSection from '../forms/GeneralServiceFormSection';
import HealthChecksFormSection from '../forms/HealthChecksFormSection';
import JSONEditor from '../../../../../../src/js/components/JSONEditor';
import NetworkingFormSection from '../forms/NetworkingFormSection';
import MultiContainerHealthChecksFormSection from '../forms/MultiContainerHealthChecksFormSection';
import MultiContainerNetworkingFormSection from '../forms/MultiContainerNetworkingFormSection';
import MultiContainerVolumesFormSection from '../forms/MultiContainerVolumesFormSection';
import ServiceErrorMessages from '../../constants/ServiceErrorMessages';
import ServiceErrorPathMapping from '../../constants/ServiceErrorPathMapping';
import ServiceUtil from '../../utils/ServiceUtil';
import PodSpec from '../../structs/PodSpec';
import TabButton from '../../../../../../src/js/components/TabButton';
import TabButtonList from '../../../../../../src/js/components/TabButtonList';
import Tabs from '../../../../../../src/js/components/Tabs';
import TabView from '../../../../../../src/js/components/TabView';
import TabViewList from '../../../../../../src/js/components/TabViewList';
import Transaction from '../../../../../../src/js/structs/Transaction';
import TransactionTypes from '../../../../../../src/js/constants/TransactionTypes';
import VolumesFormSection from '../forms/VolumesFormSection';

const METHODS_TO_BIND = [
  'handleConvertToPod',
  'handleFormChange',
  'handleFormBlur',
  'handleJSONChange',
  'handleJSONPropertyChange',
  'handleAddItem',
  'handleRemoveItem',
  'getNewStateForJSON'
];

const KEY_VALUE_FIELDS = [
  'env',
  'labels'
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
  /^localVolumes\.[0-9]+\./
];

class NewCreateServiceModalForm extends Component {
  constructor() {
    super(...arguments);

    // Hint: When you add something to the state, make sure to update the
    //       shouldComponentUpdate function, since we are trying to reduce
    //       the number of updates as much as possible.

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
        CreateServiceModalFormUtil.stripEmptyProperties(
          ServiceUtil.getServiceJSON(this.props.service)
        ),
        false,
        this.props.service instanceof PodSpec
      )
    );

    METHODS_TO_BIND.forEach((method) => {
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
    if ((this.state.isPod !== isPod) || (!deepEqual(prevJSON, nextJSON) &&
      !deepEqual(this.state.appConfig, nextJSON))) {
      this.setState(this.getNewStateForJSON(nextJSON, true, isPod));
    }
  }

  handleConvertToPod() {
    this.props.onConvertToPod(this.getAppConfig());
  }

  componentDidUpdate(prevProps, prevState) {
    const {editingFieldPath} = this.state;

    if ((editingFieldPath === null) &&
       !deepEqual(this.state.appConfig, prevState.appConfig)) {
      this.props.onChange(new this.props.service.constructor(this.state.appConfig));
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
    if (this.state.isPod !== (nextProps.service instanceof PodSpec)) {
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
    if (!deepEqual(prevJSON, nextJSON) &&
      !deepEqual(this.state.appConfig, nextJSON)) {
      return true;
    }

    // Otherwise update if the state has changed
    return (this.state.baseConfig !== nextState.baseConfig) ||
      (this.state.batch !== nextState.batch) ||
      (this.state.editingFieldPath !== nextState.editingFieldPath) ||
      (this.props.activeTab !== nextProps.activeTab) ||
      (!deepEqual(this.props.errors, nextProps.errors));
  }

  getNewStateForJSON(baseConfig = {},
    shouldValidate = true,
    isPod = this.state.isPod) {
    const newState = {
      baseConfig,
      isPod
    };

    // Regenerate batch
    newState.batch = this.props.jsonParserReducers(baseConfig).reduce(
      (batch, item) => {
        return batch.add(item);
      },
      new Batch()
    );

    // Update appConfig
    newState.appConfig = this.getAppConfig(newState.batch, baseConfig);

    return newState;
  }

  handleJSONChange(jsonObject) {
    this.setState(this.getNewStateForJSON(jsonObject));
  }

  handleJSONPropertyChange(path) {
    const {editedFieldPaths} = this.state;
    const pathStr = path.join('.');
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
    const {editedFieldPaths, batch} = this.state;
    const fieldName = event.target.getAttribute('name');
    const newState = {
      editingFieldPath: null,
      appConfig: this.getAppConfig(batch)
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

  handleFormChange(event) {
    const fieldName = event.target.getAttribute('name');
    if (!fieldName) {
      return;
    }

    let {batch} = this.state;
    let value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked;
    }
    const path = fieldName.split('.');
    batch = batch.add(new Transaction(path, value));

    const newState = {
      batch,
      editingFieldPath: fieldName
    };

    if (event.target.type === 'checkbox') {
      newState.appConfig = this.getAppConfig(batch);
    }

    this.setState(newState);
  }

  handleAddItem({value, path}) {
    let {batch} = this.state;

    batch = batch.add(
      new Transaction(path.split('.'), value, TransactionTypes.ADD_ITEM)
    );

    this.setState({batch, appConfig: this.getAppConfig(batch)});
  }

  handleRemoveItem({value, path}) {
    let {batch} = this.state;

    batch = batch.add(
      new Transaction(path.split('.'), value, TransactionTypes.REMOVE_ITEM)
    );

    this.setState({batch, appConfig: this.getAppConfig(batch)});
  }

  getAppConfig(batch = this.state.batch, baseConfig = this.state.baseConfig) {
    // Delete all key:value fields
    // Otherwise applyPatch will duplicate keys we're changing via the form
    KEY_VALUE_FIELDS.forEach(function (field) {
      delete baseConfig[field];
    });
    const patch = batch.reduce(this.props.jsonConfigReducers, {});

    return CreateServiceModalFormUtil.applyPatch(baseConfig, patch);
  }

  getErrors() {
    return ErrorMessageUtil.translateErrorMessages(
      this.props.errors, ServiceErrorMessages
    );
  }

  getErrorsAlertComponent() {
    const {showAllErrors} = this.props;
    let showErrors = this.getErrors();

    if (!showAllErrors) {
      showErrors = showErrors.filter(function (error) {
        return error.path.length === 0;
      });
    }

    if (showErrors.length === 0) {
      return null;
    }

    const errorItems = showErrors.map((error, index) => {
      const message = ErrorMessageUtil.getUnanchoredErrorMessage(
        error, ServiceErrorPathMapping);

      return (
        <li key={index} className="short">
          {`\u2022 ${message}`}
        </li>
      );
    });

    return (
      <Alert>
        <strong>There is an error with your configuration</strong>
        <div className="pod pod-narrower-left pod-shorter-top flush-bottom">
          <ul className="list-unstyled short flush-bottom">
            {errorItems}
          </ul>
        </div>
      </Alert>
    );
  }

  getContainerList(data) {
    if (Array.isArray(data.containers) && data.containers.length !== 0) {
      return data.containers.map((item, index) => {
        const fakeContainer = {name: item.name || `container-${index + 1}`};

        return (
          <TabButton
            labelClassName="text-overflow"
            key={index}
            id={`container${index}`}
            label={getContainerNameWithIcon(fakeContainer)} />
        );
      });
    }

    return null;
  }

  getContainerContent(data, errors) {
    const {service} = this.props;
    const {containers} = data;
    const errorsAlertComponent = this.getErrorsAlertComponent();

    if (containers == null) {
      return [];
    }

    return containers.map((item, index) => {
      return (
        <TabView key={index} id={`container${index}`}>
          {errorsAlertComponent}
          <ContainerServiceFormSection
            data={data}
            errors={errors}
            onAddItem={this.handleAddItem}
            onRemoveItem={this.handleRemoveItem}
            path={`containers.${index}`}
            service={service} />
        </TabView>
      );
    });
  }

  getSectionList() {
    if (this.state.isPod) {
      return [
        <TabButton id="networking" label="Networking" key="multinetworking" />,
        <TabButton id="volumes" label="Volumes" key="multivolumes" />,
        <TabButton
          id="healthChecks"
          label="Health Checks"
          key="multihealthChecks" />,
        <TabButton
          id="environment"
          label="Environment"
          key="multienvironment" />
      ];
    }

    return [
      <TabButton id="networking" label="Networking" key="networking" />,
      <TabButton id="volumes" label="Volumes" key="volumes" />,
      <TabButton id="healthChecks" label="Health Checks" key="healthChecks" />,
      <TabButton id="environment" label="Environment" key="environment" />
    ];
  }

  getSectionContent(data, errorMap) {
    const errorsAlertComponent = this.getErrorsAlertComponent();

    if (this.state.isPod) {
      return [
        <TabView id="networking" key="multinetworking">
          {errorsAlertComponent}
          <MultiContainerNetworkingFormSection
            data={data}
            errors={errorMap}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem} />
        </TabView>,
        <TabView id="volumes" key="multivolumes">
          {errorsAlertComponent}
          <MultiContainerVolumesFormSection
            data={data}
            errors={errorMap}
            handleTabChange={this.props.handleTabChange}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem} />
        </TabView>,
        <TabView id="healthChecks" key="multihealthChecks">
          {errorsAlertComponent}
          <MultiContainerHealthChecksFormSection
            data={data}
            errors={errorMap}
            handleTabChange={this.props.handleTabChange}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem} />
        </TabView>,
        <TabView id="environment" key="multienvironment">
          {errorsAlertComponent}
          <EnvironmentFormSection
            mountType="CreateService:MultiContainerEnvironmentFormSection"
            data={data}
            errors={errorMap}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem} />
        </TabView>
      ];
    }

    return [
      <TabView id="networking" key="networking">
        {errorsAlertComponent}
        <NetworkingFormSection
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem} />
      </TabView>,
      <TabView id="volumes" key="volumes">
        {errorsAlertComponent}
        <VolumesFormSection
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem} />
      </TabView>,
      <TabView id="healthChecks" key="healthChecks">
        {errorsAlertComponent}
        <HealthChecksFormSection
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem} />
      </TabView>,
      <TabView id="environment" key="environment">
        {errorsAlertComponent}
        <EnvironmentFormSection
          mountType="CreateService:EnvironmentFormSection"
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem} />
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
    const {showAllErrors} = this.props;
    const {editedFieldPaths, editingFieldPath} = this.state;

    return this.getErrors().filter(function (error) {
      const errorPath = error.path.join('.');

      // Always mute the error on the field we are editing
      if ((editingFieldPath != null) && (errorPath === editingFieldPath)) {
        return false;
      }

      // Never mute fields in the CONSTANTLY_UNMUTED_ERRORS fields
      const isUnmuted = CONSTANTLY_UNMUTED_ERRORS.some(function (rule) {
        return rule.test(errorPath);
      });

      return isUnmuted || showAllErrors || editedFieldPaths.includes(errorPath);
    });
  }

  render() {
    const {appConfig, batch} = this.state;
    const {activeTab, handleTabChange, isJSONModeActive, isEdit, onConvertToPod, service} = this.props;
    const data = batch.reduce(this.props.inputConfigReducers, {});
    const unmutedErrors = this.getUnmutedErrors();
    const errors = this.getErrors();

    const jsonEditorPlaceholderClasses = classNames(
      'modal-full-screen-side-panel-placeholder',
      {'is-visible': isJSONModeActive}
    );
    const jsonEditorClasses = classNames('modal-full-screen-side-panel', {
      'is-visible': isJSONModeActive
    });

    const errorMap = DataValidatorUtil.errorArrayToMap(unmutedErrors);
    const errorsAlertComponent = this.getErrorsAlertComponent();
    const serviceLabel = pluralize('Service', findNestedPropertyInObject(
      appConfig,
      'containers.length'
    ) || 1);

    return (
      <div className="flex flex-item-grow-1">
        <div
          className="flex flex-item-grow-1 modal-body-offset gm-scrollbar-container-flex">
          <FluidGeminiScrollbar>
            <div className="modal-body-padding-surrogate create-service-modal-form-container">
              <form
                className="create-service-modal-form container container-wide"
                onChange={this.handleFormChange}
                onBlur={this.handleFormBlur}>
                <Tabs
                  activeTab={activeTab}
                  vertical={true}
                  handleTabChange={handleTabChange}>
                  <TabButtonList className="form-tabs-list">
                    <TabButton
                      id="services"
                      label={serviceLabel}
                      key="services">
                      {this.getContainerList(data)}
                    </TabButton>
                    {this.getSectionList()}
                  </TabButtonList>
                  <TabViewList>
                    <TabView id="services">
                      {errorsAlertComponent}
                      <GeneralServiceFormSection
                        errors={errorMap}
                        data={data}
                        isEdit={isEdit}
                        onConvertToPod={onConvertToPod}
                        service={service}
                        onRemoveItem={this.handleRemoveItem}
                        onAddItem={this.handleAddItem} />
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
            width="100%" />
        </div>
      </div>
    );
  }
}

NewCreateServiceModalForm.defaultProps = {
  errors: [],
  handleTabChange() {},
  isJSONModeActive: false,
  onChange() {},
  onErrorStateChange() {},
  showAllErrors: false
};

NewCreateServiceModalForm.propTypes = {
  activeTab: PropTypes.string,
  errors: PropTypes.array,
  handleTabChange: PropTypes.func,
  isJSONModeActive: PropTypes.bool,
  onChange: PropTypes.func,
  onErrorStateChange: PropTypes.func,
  service: PropTypes.object,
  showAllErrors: PropTypes.bool
};

module.exports = NewCreateServiceModalForm;

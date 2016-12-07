import classNames from 'classnames';
import React, {PropTypes, Component} from 'react';
import deepEqual from 'deep-equal';

import Alert from '../../../../../../src/js/components/Alert';
import AppValidators from '../../../../../../src/resources/raml/marathon/v2/types/app.raml';
import PodValidators from '../../../../../../src/resources/raml/marathon/v2/types/pod.raml';
import Batch from '../../../../../../src/js/structs/Batch';
import CreateServiceModalFormUtil from '../../utils/CreateServiceModalFormUtil';
import DataValidatorUtil from '../../../../../../src/js/utils/DataValidatorUtil';
import PodContainerServiceFormSection from '../forms/PodContainerServiceFormSection';
import EnvironmentFormSection from '../forms/EnvironmentFormSection';
import MultiContainerEnvironmentFormSection from '../forms/MultiContainerEnvironmentFormSection';
import FluidGeminiScrollbar from '../../../../../../src/js/components/FluidGeminiScrollbar';
import GeneralServiceFormSection from '../forms/GeneralServiceFormSection';
import HealthChecksFormSection from '../forms/HealthChecksFormSection';
import MultiContainerHealthChecksFormSection from '../forms/MultiContainerHealthChecksFormSection';
import JSONEditor from '../../../../../../src/js/components/JSONEditor';
import NetworkingFormSection from '../forms/NetworkingFormSection';
import ServiceUtil from '../../utils/ServiceUtil';
import Pod from '../../structs/Pod';
import MarathonAppValidators from '../../validators/MarathonAppValidators';
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
  'handleAddItem',
  'handleRemoveItem',
  'getNewStateForJSON'
];

const KEY_VALUE_FIELDS = [
  'env',
  'labels'
];

const APP_ERROR_VALIDATORS = [
  AppValidators.App,
  MarathonAppValidators.containsCmdArgsOrContainer,
  MarathonAppValidators.complyWithResidencyRules,
  MarathonAppValidators.complyWithIpAddressRules
];

const POD_ERROR_VALIDATORS = [
  PodValidators.Pod
];

class NewCreateServiceModalForm extends Component {
  constructor() {
    super(...arguments);

    this.state = Object.assign(
      {
        appConfig: null,
        batch: new Batch(),
        baseConfig: {},
        errorList: [],
        isPod: false,
        jsonReducer() {},
        jsonParser() {}
      },
      this.getNewStateForJSON(
        CreateServiceModalFormUtil.stripEmptyProperties(
          ServiceUtil.getServiceJSON(this.props.service)
        ),
        false,
        this.props.service instanceof Pod
      )
    );

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * @override
   */
  componentWillReceiveProps(nextProps) {
    let prevJSON = ServiceUtil.getServiceJSON(this.props.service);
    let nextJSON = ServiceUtil.getServiceJSON(nextProps.service);
    let isPod = nextProps.service instanceof Pod;

    // Note: We ignore changes that might derrive from the `onChange` event
    //       handler. In that case the contents of nextJSON would be the same
    //       as the contents of the last rendered appConfig in the state.
    if ((this.state.isPod !== isPod) || (!deepEqual(prevJSON, nextJSON) &&
        !deepEqual(this.state.appConfig, nextJSON))) {
      this.setState(this.getNewStateForJSON(nextJSON, true, isPod));
    }
  }

  handleConvertToPod() {
    this.props.onConvertToPod(this.getAppConfig());
  }

  /**
   * @override
   */
  componentDidUpdate() {
    this.props.onChange(new this.props.service.constructor(this.state.appConfig));
    this.props.onErrorStateChange(this.state.errorList.length !== 0);
  }

  /**
   * @override
   */
  shouldComponentUpdate(nextProps, nextState) {
    // Update if json state changed
    if (this.props.isJSONModeActive !== nextProps.isJSONModeActive) {
      return true;
    }

    // Update if pod type changed
    if (this.state.isPod !== (nextProps.service instanceof Pod)) {
      return true;
    }

    // Update if service property has changed
    //
    // Note: We ignore changes that might derrive from the `onChange` event
    // handler. In that case the contents of nextJSON would be the same
    // as the contents of the last rendered appConfig in the state.
    //
    let prevJSON = ServiceUtil.getServiceJSON(this.props.service);
    let nextJSON = ServiceUtil.getServiceJSON(nextProps.service);
    if (!deepEqual(prevJSON, nextJSON) &&
      !deepEqual(this.state.appConfig, nextJSON)) {
      return true;
    }

    // Otherwise update if the state has changed
    return (this.state.errorList !== nextState.errorList) ||
      (this.state.baseConfig !== nextState.baseConfig) ||
      (this.state.batch !== nextState.batch);
  }

  getNewStateForJSON(baseConfig = {}, shouldValidate = true, isPod = this.state.isPod) {
    let newState = {
      baseConfig,
      isPod
    };

    // Regenerate batch
    newState.batch = this.props.jsonParserReducers(baseConfig).reduce(
      (batch, item) => { return batch.add(item); },
      new Batch()
    );

    let ERROR_VALIDATORS = APP_ERROR_VALIDATORS;

    if (isPod) {
      ERROR_VALIDATORS = POD_ERROR_VALIDATORS;
    }

    if (shouldValidate) {
      newState.errorList = DataValidatorUtil.validate(
        baseConfig,
        ERROR_VALIDATORS
      );
    }

    // Update appConfig
    newState.appConfig = this.getAppConfig(newState.batch, baseConfig);

    return newState;
  }

  handleJSONChange(jsonObject) {
    this.setState(this.getNewStateForJSON(jsonObject));
  }

  handleFormBlur(event) {
    let fieldName = event.target.getAttribute('name');
    if (!fieldName) {
      return;
    }

    // Run data validation on the raw data
    this.validateCurrentState();
  }

  handleFormChange(event) {
    let fieldName = event.target.getAttribute('name');
    if (!fieldName) {
      return;
    }

    let {batch} = this.state;
    let value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked;
    }
    let path = fieldName.split('.');
    batch = batch.add(new Transaction(path, value));

    this.setState({
      // Render the new appconfig
      appConfig: this.getAppConfig(batch),
      batch,
      // [Case F1] Reset errors only on the current field
      errorList: DataValidatorUtil.stripErrorsOnPath(
        this.state.errorList,
        path
      )
    });
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

  validateCurrentState() {
    let {errorList} = this.getNewStateForJSON(this.getAppConfig());

    this.setState({errorList});

    return Boolean(errorList.length);
  }

  getAppConfig(batch = this.state.batch, baseConfig = this.state.baseConfig) {
    // Delete all key:value fields
    // Otherwise applyPatch will duplicate keys we're changing via the form
    KEY_VALUE_FIELDS.forEach(function (field) {
      delete baseConfig[field];
    });
    let patch = batch.reduce(this.props.jsonConfigReducers, {});

    return CreateServiceModalFormUtil.applyPatch(baseConfig, patch);
  }

  getRootErrorMessage() {
    let rootErrors = this.state.errorList.reduce(function (errors, error) {
      if (error.path.length !== 0) {
        return errors;
      }

      errors.push(<Alert>{error.message}</Alert>);

      return errors;
    }, []);

    if (rootErrors.length === 0) {
      return null;
    }

    return rootErrors;
  }

  getContainerList(data) {
    if (data.containers && data.containers.length !== 0) {
      return data.containers.map((item, index) => {
        return (
            <TabButton key={index} id={`container${index}`}
                label={item.name || `container ${index + 1}`}/>
        );
      });
    }

    return null;
  }

  getContainerContent(data, errors) {
    let {containers = []} = data;
    return containers.map((item, index) => {
      let itemErrors = errors && errors.containers && errors.containers[item];

      return (
          <TabView key={index} id={`container${index}`}>
            <PodContainerServiceFormSection
                path={`containers.${index}`}
                data={data}
                errors={itemErrors}
                onRemoveItem={this.handleRemoveItem}
                onAddItem={this.handleAddItem} />
          </TabView>
      );
    });
  }

  getSectionList() {
    if (this.state.isPod) {
      return [
        <TabButton id="networking" label="Networking" key="networking" />,
        <TabButton id="environment" label="Environment" key="multienvironment"/>,
        <TabButton id="healthChecks" label="Health Checks" key="multihealthChecks"/>
      ];
    }
    return [
      <TabButton id="networking" label="Networking" key="networking" />,
      <TabButton id="environment" label="Environment" key="environment"/>,
      <TabButton id="healthChecks" label="Health Checks" key="healthChecks"/>,
      <TabButton id="volumes" label="Volumes" key="volumes"/>
    ];
  }

  getSectionContent(data, errorMap) {
    let rootErrorComponent = this.getRootErrorMessage();

    if (this.state.isPod) {
      return [
        <TabView id="environment" key="multienvironment">
          {rootErrorComponent}
          <MultiContainerEnvironmentFormSection
              data={data}
              errors={errorMap}
              onRemoveItem={this.handleRemoveItem}
              onAddItem={this.handleAddItem} />
        </TabView>,
        <TabView id="healthChecks" key="multihealthChecks">
          <MultiContainerHealthChecksFormSection
              data={data}
              errors={errorMap}
              onRemoveItem={this.handleRemoveItem}
              onAddItem={this.handleAddItem} />
        </TabView>,
        <TabView id="networking" key="networking">
          <NetworkingFormSection
              data={data}
              errors={errorMap}
              onRemoveItem={this.handleRemoveItem}
              onAddItem={this.handleAddItem} />
        </TabView>
      ];
    }

    return [
      <TabView id="environment" key="environment">
        {rootErrorComponent}
        <EnvironmentFormSection
            data={data}
            errors={errorMap}
            onRemoveItem={this.handleRemoveItem}
            onAddItem={this.handleAddItem} />
      </TabView>,
      <TabView id="volumes" key="volumes">
        <VolumesFormSection
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem} />
      </TabView>,
      <TabView id="healthChecks" key="healthChecks">
        <HealthChecksFormSection
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem} />
      </TabView>,
      <TabView id="networking" key="networking">
        <NetworkingFormSection
          data={data}
          errors={errorMap}
          onRemoveItem={this.handleRemoveItem}
          onAddItem={this.handleAddItem} />
      </TabView>
    ];
  }

  render() {
    let {appConfig, batch, errorList} = this.state;
    let {isJSONModeActive, isEdit, onConvertToPod, service} = this.props;
    let data = batch.reduce(this.props.inputConfigReducers, {});

    let jsonEditorPlaceholderClasses = classNames(
      'modal-full-screen-side-panel-placeholder',
      {'is-visible': isJSONModeActive}
    );
    let jsonEditorClasses = classNames('modal-full-screen-side-panel', {
      'is-visible': isJSONModeActive
    });

    let errorMap = DataValidatorUtil.errorArrayToMap( errorList );
    let rootErrorComponent = this.getRootErrorMessage();

    return (
      <div className="flex flex-item-grow-1">
        <div className="flex flex-item-grow-1 modal-body-offset gm-scrollbar-container-flex">
          <FluidGeminiScrollbar>
            <div className="container flex flex-direction-top-to-bottom modal-body-padding-surrogate">
              <form onChange={this.handleFormChange}
                onBlur={this.handleFormBlur}>
                <Tabs vertical={true}>
                  <TabButtonList>
                    <TabButton id="services" label="Services" />
                    {this.getContainerList(data)}
                    {this.getSectionList()}
                  </TabButtonList>
                  <TabViewList>
                    <TabView id="services">
                      {rootErrorComponent}
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
            errors={errorList}
            onChange={this.handleJSONChange}
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
  isJSONModeActive: false,
  onChange() {},
  onErrorStateChange() {}
};

NewCreateServiceModalForm.propTypes = {
  isJSONModeActive: PropTypes.bool,
  onChange: PropTypes.func,
  onErrorStateChange: PropTypes.func,
  service: PropTypes.object
};

module.exports = NewCreateServiceModalForm;

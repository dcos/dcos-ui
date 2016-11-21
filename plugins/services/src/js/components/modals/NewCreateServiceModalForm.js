import classNames from 'classnames';
import React, {PropTypes, Component} from 'react';
import deepEqual from 'deep-equal';

import Alert from '../../../../../../src/js/components/Alert';
import AppValidators from '../../../../../../src/resources/raml/marathon/v2/types/app.raml';
import CreateServiceModalFormUtil from '../../utils/CreateServiceModalFormUtil';
import Batch from '../../../../../../src/js/structs/Batch';
import ContainerServiceFormSection from '../forms/ContainerServiceFormSection';
import {combineParsers} from '../../../../../../src/js/utils/ParserUtil';
import {combineReducers} from '../../../../../../src/js/utils/ReducerUtil';
import EnvironmentFormSection from '../forms/EnvironmentFormSection';
import GeneralServiceFormSection from '../forms/GeneralServiceFormSection';
import HealthChecksFormSection from '../forms/HealthChecksFormSection';
import JSONConfigReducers from '../../reducers/JSONConfigReducers';
import JSONParserReducers from '../../reducers/JSONParserReducers';
import JSONEditor from '../../../../../../src/js/components/JSONEditor';
import Service from '../../structs/Service';
import TabButton from '../../../../../../src/js/components/TabButton';
import TabButtonList from '../../../../../../src/js/components/TabButtonList';
import Tabs from '../../../../../../src/js/components/Tabs';
import TabView from '../../../../../../src/js/components/TabView';
import TabViewList from '../../../../../../src/js/components/TabViewList';
import Transaction from '../../../../../../src/js/structs/Transaction';
import TransactionTypes from '../../../../../../src/js/constants/TransactionTypes';
import DataValidatorUtil from '../../../../../../src/js/utils/DataValidatorUtil';

const METHODS_TO_BIND = [
  'handleFormChange',
  'handleFormBlur',
  'handleJSONChange',
  'handleAddItem',
  'handleRemoveItem'
];

const SECTIONS = [
  ContainerServiceFormSection,
  EnvironmentFormSection,
  GeneralServiceFormSection,
  HealthChecksFormSection
];

const ERROR_VALIDATORS = [
  AppValidators.App
];

const jsonParserReducers = combineParsers(JSONParserReducers);
const jsonConfigReducers = combineReducers(JSONConfigReducers);
const inputConfigReducers = combineReducers(
  Object.assign({}, ...SECTIONS.map((item) => item.configReducers))
);

function getServiceJSON(service) {
  if (!service) {
    return {};
  }

  if (service.toJSON !== undefined) {
    return service.toJSON();
  }

  return service;
}

class NewCreateServiceModalForm extends Component {
  constructor() {
    super(...arguments);

    this.state = Object.assign(
      {
        batch: new Batch(),
        appConfig: {},
        errorList: []
      },
      this.getNewStateForJSON(getServiceJSON(this.props.service))
    );

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * @override
   */
  componentWillReceiveProps(nextProps) {
    let prevJSON = getServiceJSON(this.props.service);
    let nextJSON = getServiceJSON(nextProps.service);
    if (!deepEqual(prevJSON, nextJSON)) {
      this.setState(this.getNewStateForJSON(nextJSON));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {

    // Update if json state or the service has changed from outside
    if (this.props.isJSONModeActive !== nextProps.isJSONModeActive) {
      return true;
    }
    if (!deepEqual(this.props.service.toJSON(), nextProps.service.toJSON())) {
      return true;
    };

    // Otherwise update if the state has changed
    return (this.state.errorList !== nextState.errorList) ||
           (this.state.appConfig !== nextState.appConfig) ||
           (this.state.batch !== nextState.batch);
  }

  getNewStateForJSON(appConfig={}) {
    // Regenerate batch
    let batch = jsonParserReducers(appConfig).reduce((batch, item) => {
      return batch.add(item);
    }, new Batch());

    // Perform error validation
    let errorList = DataValidatorUtil.validate(appConfig, ERROR_VALIDATORS);

    return {batch, errorList, appConfig};
  }

  handleJSONChange(jsonObject) {
    this.setState(this.getNewStateForJSON(jsonObject));
  }

  handleFormBlur() {
    // Run data validation on the raw data
    this.setState({
      errorList: DataValidatorUtil.validate(
        this.getAppConfig(),
        ERROR_VALIDATORS
      )
    });
  }

  handleFormChange(event) {
    let {batch} = this.state;

    let value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked;
    }
    let path = event.target.getAttribute('name').split('.');
    batch = batch.add(new Transaction(path, value));
    let newState = {batch};

    // [Case F1] Reset errors only on the current field
    newState.errorList = DataValidatorUtil.stripErrorsOnPath(
      this.state.errorList,
      path
    );

    this.setState(newState);
  }

  getAppConfig() {
    let {appConfig, batch} = this.state;
    let patch = batch.reduce(jsonConfigReducers, {});
    return CreateServiceModalFormUtil.applyPatch(appConfig, patch);
  }

  handleAddItem({value, path}) {
    let {batch} = this.state;
    this.setState({
      batch: batch.add(
        new Transaction(path.split('.'), value, TransactionTypes.ADD_ITEM)
      )
    });
  }

  handleRemoveItem({value, path}) {
    let {batch} = this.state;
    this.setState({
      batch: batch.add(
        new Transaction(path.split('.'), value, TransactionTypes.REMOVE_ITEM)
      )
    });
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

  render() {
    let {batch, errorList} = this.state;
    let {isJSONModeActive} = this.props;
    let data = batch.reduce(inputConfigReducers, {});

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
        <div className="container flex flex-direction-top-to-bottom">
          <form onChange={this.handleFormChange} onBlur={this.handleFormBlur}>
            <Tabs vertical={true}>
              <TabButtonList>
                <TabButton id="services" label="Services" />
                <TabButton id="environment" label="Environment" />
                <TabButton id="healthChecks" label="Health Checks" />
              </TabButtonList>
              <TabViewList>
                <TabView id="services">
                  {rootErrorComponent}
                  <GeneralServiceFormSection errors={errorMap} data={data} />
                </TabView>
                <TabView id="environment">
                  {rootErrorComponent}
                  <EnvironmentFormSection
                    data={data}
                    onRemoveItem={this.handleRemoveItem}
                    onAddItem={this.handleAddItem} />
                </TabView>
                <TabView id="healthChecks">
                  <HealthChecksFormSection data={data}
                    onRemoveItem={this.handleRemoveItem}
                    onAddItem={this.handleAddItem} />
                </TabView>
              </TabViewList>
            </Tabs>
          </form>
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
            value={this.getAppConfig()}
            width="100%" />
        </div>
      </div>
    );
  }
}

NewCreateServiceModalForm.defaultProps = {
  isJSONModeActive: false,
  onChange() {}
};

NewCreateServiceModalForm.propTypes = {
  isJSONModeActive: PropTypes.bool,
  onChange: PropTypes.func,
  service: PropTypes.instanceOf(Service)
};

module.exports = NewCreateServiceModalForm;

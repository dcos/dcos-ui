import classNames from 'classnames';
import React, {PropTypes, Component} from 'react';
import deepEqual from 'deep-equal';

import Alert from '../../../../../../src/js/components/Alert';
import AppValidators from '../../../../../../src/resources/raml/marathon/v2/types/app.raml';
import Batch from '../../../../../../src/js/structs/Batch';
import CreateServiceModalFormUtil from '../../utils/CreateServiceModalFormUtil';
import ContainerServiceFormSection from '../forms/ContainerServiceFormSection';
import {combineParsers} from '../../../../../../src/js/utils/ParserUtil';
import {combineReducers} from '../../../../../../src/js/utils/ReducerUtil';
import EnvironmentFormSection from '../forms/EnvironmentFormSection';
import GeneralServiceFormSection from '../forms/GeneralServiceFormSection';
import HealthChecksFormSection from '../forms/HealthChecksFormSection';
import JSONConfigReducers from '../../reducers/JSONConfigReducers';
import JSONParserReducers from '../../reducers/JSONParserReducers';
import JSONEditor from '../../../../../../src/js/components/JSONEditor';
import ServiceUtil from '../../utils/ServiceUtil';
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

class NewCreateServiceModalForm extends Component {
  constructor() {
    super(...arguments);

    this.state = Object.assign(
      {
        batch: new Batch(),
        baseConfig: {},
        appConfig: null,
        errorList: []
      },
      this.getNewStateForJSON(
        CreateServiceModalFormUtil.stripEmptyProperties(
          ServiceUtil.getServiceJSON(this.props.service)
        ),
        false
      )
    );

    // Render initial app config
    this.state.appConfig = this.getAppConfig(this.state);

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

    // Note: We ignore changes that might derrive from the `onChange` event
    //       handler. In that case the contents of nextJSON would be the same
    //       as the contents of the last rendered appConfig in the state.
    if (!deepEqual(prevJSON, nextJSON) &&
        !deepEqual(this.state.appConfig, nextJSON)) {
      console.log('Updating because service changed');
      this.setState(this.getNewStateForJSON(nextJSON));
    }
  }

  /**
   * @override
   */
  componentDidUpdate() {
    this.props.onChange(this.state.appConfig);
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

    // Update if service property has changed
    //
    // Note: We ignore changes that might derrive from the `onChange` event
    //       handler. In that case the contents of nextJSON would be the same
    //       as the contents of the last rendered appConfig in the state.
    //
    let prevJSON = ServiceUtil.getServiceJSON(this.props.service);
    let nextJSON = ServiceUtil.getServiceJSON(nextProps.service);
    if (!deepEqual(prevJSON, nextJSON) &&
        !deepEqual(this.state.appConfig, nextJSON)) {
      console.log('Will update because service changed');
      return true;
    };

    // Otherwise update if the state has changed
    return (this.state.errorList !== nextState.errorList) ||
           (this.state.baseConfig !== nextState.baseConfig) ||
           (this.state.batch !== nextState.batch);
  }

  getNewStateForJSON(baseConfig={}, validate=true) {
    let newState = {
      appConfig: {},
      baseConfig
    };

    // Regenerate batch
    newState.batch = jsonParserReducers(baseConfig).reduce((batch, item) => {
      return batch.add(item);
    }, new Batch());

    // Perform error validation
    if (validate) {
      newState.errorList = DataValidatorUtil.validate(baseConfig, ERROR_VALIDATORS);
    }

    return newState;
  }

  handleJSONChange(jsonObject) {
    let newState = this.getNewStateForJSON(jsonObject);
    newState.appConfig = this.getAppConfig(newState);
    this.setState(newState);
  }

  handleFormBlur(event) {
    let path = event.target.getAttribute('name').split('.');
    let appConfig = this.getAppConfig();
    let errorList = DataValidatorUtil.validate(
      appConfig,
      ERROR_VALIDATORS
    );

    // Keep errors only for this field
    errorList = DataValidatorUtil.updateOnlyOnPath(this.state.errorList, errorList, path);

    // Run data validation on the raw data
    this.setState({errorList, appConfig});
  }

  handleFormChange(event) {
    let {batch, baseConfig} = this.state;

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

    // Render the new appconfig
    newState.appConfig = this.getAppConfig({
      batch, baseConfig
    });

    this.setState(newState);
  }

  getAppConfig(currentState = this.state) {
    let {baseConfig, batch} = currentState;
    let patch = batch.reduce(jsonConfigReducers, {});
    return CreateServiceModalFormUtil.applyPatch(baseConfig, patch);
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
    let {appConfig, batch, errorList} = this.state;
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

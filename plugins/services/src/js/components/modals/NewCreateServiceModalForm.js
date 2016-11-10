import Ace from 'react-ace';
import classNames from 'classnames';
import React from 'react';

import AppValidators from '../../../../../../src/resources/raml/v2/types/app.raml';
import Batch from '../../../../../../src/js/structs/Batch';
import {combineParsers} from '../../../../../../src/js/utils/ParserUtil';
import {combineReducers} from '../../../../../../src/js/utils/ReducerUtil';
import JSONConfigReducers from '../../reducers/JSONConfigReducers';
import JSONParserReducers from '../../reducers/JSONParserReducers';
import ServiceFormSection from '../forms/ServiceFormSection';
import EnvironmentFormSection from '../forms/EnvironmentFormSection';
import TabButton from '../../../../../../src/js/components/TabButton';
import TabButtonList from '../../../../../../src/js/components/TabButtonList';
import Tabs from '../../../../../../src/js/components/Tabs';
import TabView from '../../../../../../src/js/components/TabView';
import TabViewList from '../../../../../../src/js/components/TabViewList';
import Transaction from '../../../../../../src/js/structs/Transaction';
import TransactionTypes from '../../../../../../src/js/constants/TransactionTypes';
import Util from '../../../../../../src/js/utils/Util';
import DataValidatorUtil from '../../../../../../src/js/utils/DataValidatorUtil';

const METHODS_TO_BIND = [
  'handleFormChange',
  'handleFormBlur',
  'handleJSONBlur',
  'handleJSONChange',
  'handleAddItem',
  'handleRemoveItem'
];

const SECTIONS = [
  ServiceFormSection,
  EnvironmentFormSection
];

const jsonParserReducers = combineParsers(JSONParserReducers);
const jsonConfigReducers = combineReducers(JSONConfigReducers);
const inputConfigReducers = combineReducers(
  Object.assign({}, ...SECTIONS.map((item) => item.configReducers))
);
const validationReducers = combineReducers(
  Object.assign({}, ...SECTIONS.map((item) => item.validationReducers))
);

class NewCreateServiceModalForm extends React.Component {
  constructor() {
    super(...arguments);

    let batch = new Batch();

    this.state = {
      appConfig: {},
      batch,
      errors: {},
      jsonValue: JSON.stringify(batch.reduce(jsonConfigReducers, {}), null, 2)
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleJSONBlur() {
    let {errors, jsonValue} = this.state;
    let newState = {};
    let appConfig;

    try {
      appConfig = JSON.parse(jsonValue);
    } catch (event) {
      // TODO: handle error
      newState.errors = Object.assign(errors, {
        jsonEditor: 'JSON value is not valid json.'
      });
    }

    if (appConfig) {
      // Flush batch
      let batch = new Batch();

      // Run validation reducers
      let errors = Util.filterEmptyValues(
        batch.reduce(validationReducers, appConfig)
      );

      // Translate appConfig to batch transactions
      jsonParserReducers(appConfig).forEach((item) => {
        batch.add(item);
      });

      // Update batch, errors and appConfig
      Object.assign(newState, {batch, errors, appConfig: {}});
    }

    this.setState(newState);
  }

  handleJSONChange(jsonValue) {
    let newState = {jsonValue};
    let parsedData;

    try {
      parsedData = JSON.parse(jsonValue);
    } catch (event) {
      // Not valid json, let's wait with firing event for new data
    }

    if (parsedData) {
      let batch = new Batch();
      let appConfig = {};
      jsonParserReducers(parsedData).forEach((item) => {
        batch.add(item);
      });
      Object.assign(newState, {batch, appConfig});
    }

    this.setState(newState);
  }

  handleFormBlur() {
    // Create temporary finalized appConfig
    let appConfig = this.getAppConfig();

    // Run validation reducers on appConfig
    let errorList = DataValidatorUtil.validate(appConfig, [
      AppValidators.App
    ]);

    errorList.forEach(function (error) {
      console.error('on /' + error.path.join('/') + ': ' + error.message);
    });

    let errors = DataValidatorUtil.errorArrayToMap( errorList );

    // Create new jsonValue
    let jsonValue = JSON.stringify(appConfig, null, 2);
    this.setState({errors, jsonValue});
  }

  handleFormChange(event) {
    let {batch, appConfig} = this.state;

    let value = event.target.value;
    let path = event.target.getAttribute('name');
    batch.add(new Transaction(path.split('.'), value));
    let newState = {batch};

    // Only update the jsonValue if we have a valid value
    if (event.target.validity.valid) {
      newState.jsonValue = JSON.stringify(
        batch.reduce(jsonConfigReducers, appConfig),
        null,
        2
      );
    }

    this.setState(newState);
  }

  getAppConfig() {
    let {appConfig, batch} = this.state;

    return batch.reduce(jsonConfigReducers, appConfig);
  }

  handleAddItem({value, path}) {
    let {appConfig, batch} = this.state;
    batch.add(new Transaction(path.split(','), value, TransactionTypes.ADD_ITEM));

    // Update JSON data
    let jsonValue = JSON.stringify(batch.reduce(jsonConfigReducers, appConfig), null, 2);
    this.setState({batch, jsonValue});
  }

  handleRemoveItem({value, path}) {
    let {appConfig, batch} = this.state;
    batch.add(new Transaction(path.split(','), value, TransactionTypes.REMOVE_ITEM));

    // Update JSON data
    let jsonValue = JSON.stringify(batch.reduce(jsonConfigReducers, appConfig), null, 2);
    this.setState({batch, jsonValue});
  }

  render() {
    let {appConfig, batch, errors, jsonValue} = this.state;
    let {isJSONModeActive} = this.props;
    let data = batch.reduce(inputConfigReducers, appConfig);

    let jsonEditorPlaceholderClasses = classNames(
      'modal-full-screen-side-panel-placeholder',
      {'is-visible': isJSONModeActive}
    );
    let jsonEditorClasses = classNames('modal-full-screen-side-panel', {
      'is-visible': isJSONModeActive
    });

    return (
      <div className="flex flex-item-grow-1">
        <div className="container flex flex-direction-top-to-bottom">
          <form onChange={this.handleFormChange} onBlur={this.handleFormBlur}>
            <Tabs vertical={true}>
              <TabButtonList>
                <TabButton id="services" label="Services" />
                <TabButton id="environment" label="Environment" />
              </TabButtonList>
              <TabViewList>
                <TabView id="services">
                  <ServiceFormSection errors={errors} data={data} />
                </TabView>
                <TabView id="environment">
                  <EnvironmentFormSection
                    data={data}
                    onRemoveItem={this.handleRemoveItem}
                    onAddItem={this.handleAddItem} />
                </TabView>
              </TabViewList>
            </Tabs>
          </form>
        </div>
        <div className={jsonEditorPlaceholderClasses} />
        <div className={jsonEditorClasses}>
          <Ace
            editorProps={{$blockScrolling: true}}
            mode="json"
            onBlur={this.handleJSONBlur}
            onChange={this.handleJSONChange}
            showGutter={true}
            showPrintMargin={false}
            theme="monokai"
            height="100%"
            value={jsonValue}
            width="100%" />
        </div>
      </div>
    );
  }
}

NewCreateServiceModalForm.defaultProps = {
  onChange() {}
};

NewCreateServiceModalForm.propTypes = {
  onChange: React.PropTypes.func
};

module.exports = NewCreateServiceModalForm;

import Ace from 'react-ace';
import classNames from 'classnames';
import React from 'react';

import Batch from '../../../../../../src/js/structs/Batch';
import JSONConfigReducers from '../../reducers/JSONConfigReducers';
import JSONParserReducers from '../../reducers/JSONParserReducers';
import ParserUtil from '../../../../../../src/js/utils/ParserUtil';
import ReducerUtil from '../../../../../../src/js/utils/ReducerUtil';
import ServiceFormSection from '../forms/ServiceFormSection';
import TabButton from '../../../../../../src/js/components/TabButton';
import TabButtonList from '../../../../../../src/js/components/TabButtonList';
import Tabs from '../../../../../../src/js/components/Tabs';
import TabViewList from '../../../../../../src/js/components/TabViewList';
import Transaction from '../../../../../../src/js/structs/Transaction';
import Util from '../../../../../../src/js/utils/Util';

const METHODS_TO_BIND = [
  'handleFormChange',
  'handleFormBlur',
  'handleJSONBlur',
  'handleJSONChange'
];

const SECTIONS = [
  ServiceFormSection
];

class NewCreateServiceModalForm extends React.Component {
  constructor() {
    super(...arguments);

    let batch = new Batch();

    let jsonParserReducers = ParserUtil.combineParsers(JSONParserReducers);
    let jsonConfigReducers = ReducerUtil.combineReducers(JSONConfigReducers);
    let inputConfigReducers = ReducerUtil.combineReducers(
      Object.assign({}, ...SECTIONS.map((item) => {
        return item.configReducers;
      }))
    );
    let validationReducers = ReducerUtil.combineReducers(
      Object.assign({}, ...SECTIONS.map((item) => {
        return item.validationReducers;
      }))
    );

    this.state = {
      appConfig: {},
      batch,
      errors: {},
      inputConfigReducers,
      jsonConfigReducers,
      jsonValue: JSON.stringify(batch.reduce(jsonConfigReducers, {}), null, 2),
      jsonParserReducers,
      validationReducers
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleJSONBlur() {
    try {
      let {jsonParserReducers, jsonValue, validationReducers} = this.state;
      let appConfig = JSON.parse(jsonValue);
      let batch = new Batch();

      // Run validation reducers on appConfig with new on minimal batch
      let errors = Util.filterEmptyValues(
        batch.reduce(validationReducers, appConfig)
      );

      // Add additional events after verification
      jsonParserReducers(appConfig).forEach((item) => {
        batch.add(item);
      });

      // This will essentially flush the batch
      this.setState({appConfig: {}, batch, errors});
    } catch (event) {
      // TODO: handle error
      let errors = Object.assign(
        {},
        this.state.errors,
        {jsonEditor: 'JSON value is not valid json.'}
      );
      this.setState({errors});
    }
  }

  handleJSONChange(jsonValue) {
    try {
      let batch = new Batch();
      let parsedData = JSON.parse(jsonValue);
      let appConfig = batch.reduce(this.state.jsonConfigReducers, parsedData);
      this.setState({appConfig, batch, jsonValue});
    } catch (event) {
      // Not valid json, let's wait with firing event for new data
      this.setState({jsonValue});
    }
  }

  handleFormBlur() {
    let {validationReducers} = this.state;

    // Create temporary finalized appConfig
    let appConfig = this.getAppConfig();

    // Run validation reducers on appConfig
    let errors = Util.filterEmptyValues(
      new Batch().reduce(validationReducers, appConfig)
    );

    // Create new jsonValue
    let jsonValue = JSON.stringify(appConfig, null, 2);
    this.setState({errors, jsonValue});
  }

  handleFormChange(event) {
    let {batch, jsonConfigReducers, appConfig} = this.state;

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
    let {appConfig, batch, jsonConfigReducers} = this.state;

    return batch.reduce(jsonConfigReducers, appConfig);
  }

  render() {
    let {appConfig, batch, errors, inputConfigReducers, jsonValue} = this.state;
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
              </TabButtonList>
              <TabViewList>
                <ServiceFormSection errors={errors} data={data} />
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

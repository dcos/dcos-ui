import Ace from 'react-ace';
import classNames from 'classnames';
import React from 'react';

import Batch from '../../../../../../src/js/structs/Batch';
import ReducerUtil from '../../../../../../src/js/utils/ReducerUtil';
import ParserUtil from '../../../../../../src/js/utils/ParserUtil';
import ServiceFormSection from '../forms/ServiceFormSection';
import ServiceValidatorUtil from '../..//utils/ServiceValidatorUtil';
import TabButton from '../../../../../../src/js/components/TabButton';
import TabButtonList from '../../../../../../src/js/components/TabButtonList';
import Tabs from '../../../../../../src/js/components/Tabs';
import TabView from '../../../../../../src/js/components/TabView';
import TabViewList from '../../../../../../src/js/components/TabViewList';
import Transaction from '../../../../../../src/js/structs/Transaction';
import TransactionTypes from '../../../../../../src/js/constants/TransactionTypes';
import Util from '../../../../../../src/js/utils/Util';

const METHODS_TO_BIND = [
  'handleJSONBlur',
  'handleJSONChange',
  'handleAddEvent'
];

class NewCreateServiceModalForm extends React.Component {
  constructor() {
    super(...arguments);

    let batch = new Batch();
    batch.add({action: 'INIT'});

    let validationReducers = ReducerUtil.combineReducers({
      id(state = '/', {path, type, value}) {
        if (type === TransactionTypes.SET && path.join() === 'id' && ServiceValidatorUtil.isValidServiceID(value)) {
          return `Error: id cannot be "${value}"`;
        }
      },
      cpus: ReducerUtil.simpleFloatReducer('cpus', 0.01),
      mem: ReducerUtil.simpleIntReducer('mem', 128),
      disk: ReducerUtil.simpleIntReducer('disk', 0),
      instances: ReducerUtil.simpleIntReducer('instances', 1),
      cmd: ReducerUtil.simpleStringReducer('cmd')
    });

    let parseReducers = ParserUtil.combineParsers([
      ParserUtil.simpleParser(['id']),
      ParserUtil.simpleParser(['cpus']),
      ParserUtil.simpleParser(['mem']),
      ParserUtil.simpleParser(['disk']),
      ParserUtil.simpleParser(['instances']),
      ParserUtil.simpleParser(['cmd'])
    ]);

    let jsonReducers = ReducerUtil.combineReducers({
      id: ReducerUtil.simpleReducer('id', '/'),
      cpus: ReducerUtil.simpleReducer('cpus', 0.01),
      mem: ReducerUtil.simpleReducer('mem', 128),
      disk: ReducerUtil.simpleReducer('disk', 0),
      instances: ReducerUtil.simpleReducer('instances', 1),
      cmd: ReducerUtil.simpleReducer('cmd', '')
    });

    this.state = {
      appConfig: {},
      batch,
      parseReducers,
      jsonReducers,
      validationReducers,
      jsonValue: JSON.stringify(batch.reduce(jsonReducers, {}), null, 2)
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleJSONBlur() {
    if (!this.ace || !this.ace.editor) {
      return;
    }

    let updateState = {jsonValue: this.ace.editor.getValue()};

    try {
      let appConfig = JSON.parse(updateState.jsonValue);
      let batch = new Batch();
      batch.add({action: 'INIT'});

      this.state.parseReducers(appConfig).forEach((item) => {
        batch.add(item);
      });

      let errors = batch.reduce(this.state.validationReducers, appConfig);
      if (Object.keys(Util.filterEmptyValues(errors)).length) {
        throw new Error(Object.values(errors).join(', '));
      }

      updateState.appConfig = appConfig;
      updateState.batch = batch;
    } catch (event) {
      // TODO: handle error
      console.log('JSON value is not valid json. Could not store it', event);
    }

    this.setState(updateState);
  }

  handleJSONChange(jsonValue) {
    let updateState = {jsonValue};

    try {
      let appConfig = JSON.parse(jsonValue);
      let batch = new Batch();
      batch.add({action: 'INIT'});

      appConfig = batch.reduce(this.state.jsonReducers, appConfig);
      updateState.appConfig = appConfig;
      updateState.batch = batch;
    } catch (event) {
      // Not valid json, let's wait with storing new appConfig
    }

    this.setState(updateState);
  }

  handleAddEvent(event) {
    let {appConfig, batch, jsonReducers} = this.state;
    let value = event.target.value;
    let path = event.target.getAttribute('name');
    batch.add(new Transaction(path.split(','), value));

    // Update JSON data
    let jsonValue = JSON.stringify(batch.reduce(jsonReducers, appConfig), null, 2);
    this.setState({batch, jsonValue});
  }

  render() {
    let {isJSONModeActive} = this.props;
    let {appConfig, batch, jsonValue} = this.state;

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
          <form onChange={this.handleAddEvent}>
            <Tabs vertical={true}>
              <TabButtonList>
                <TabButton id="services" label="Services">
                  <TabButton id="container-1" label="Container 1" />
                  <TabButton id="container-2" label="Container 2" />
                </TabButton>
              </TabButtonList>
                <TabViewList>
                  <ServiceFormSection data={appConfig} batch={batch} />
                  <TabView id="container-1">
                    Container 1 Content
                  </TabView>
                  <TabView id="container-2">
                    Container 2 Content
                  </TabView>
                </TabViewList>
            </Tabs>
          </form>
        </div>
        <div className={jsonEditorPlaceholderClasses} />
        <div className={jsonEditorClasses}>
          <Ace
            ref={(ref) => { this.ace = ref; }}
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

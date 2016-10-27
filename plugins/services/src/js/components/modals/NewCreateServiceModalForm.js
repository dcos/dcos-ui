import Ace from 'react-ace';
import classNames from 'classnames';
import React from 'react';

import Transaction from '../../../../../../src/js/structs/Transaction';
import Batch from '../../../../../../src/js/structs/Batch';
import ServiceFormSection from '../forms/ServiceFormSection';
import ReducerUtil from '../../../../../../src/js/utils/ReducerUtil';
import Tabs from '../../../../../../src/js/components/Tabs';
import TabButton from '../../../../../../src/js/components/TabButton';
import TabButtonList from '../../../../../../src/js/components/TabButtonList';
import TabView from '../../../../../../src/js/components/TabView';
import TabViewList from '../../../../../../src/js/components/TabViewList';

const METHODS_TO_BIND = [
  'handleJSONChange',
  'handleAddEvent',
  'handleAddReducer'
];

class NewCreateServiceModalForm extends React.Component {
  constructor() {
    super(...arguments);

    let batch = new Batch();
    batch.add({action: 'INIT'});

    this.state = {
      appConfig: {},
      batch,
      reducerConfig: {}
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleJSONChange(jsonValue) {
    try {
      let appConfig = JSON.parse(jsonValue);
      let batch = new Batch();
      batch.add({action: 'INIT'});
      this.setState({appConfig, batch});
    } catch (event) {
      // TODO: handle error
      alert('JSON value is not valid json. Could not store it', event);
    }
  }

  handleAddEvent(event) {
    let {batch} = this.state;
    let value = event.target.value;
    let path = event.target.getAttribute('name');
    batch.add(new Transaction(path.split(','), value));

    this.setState({batch});
  }

  handleAddReducer(reducerConfig) {
    this.setState({
      reducerConfig: Object.assign({}, this.state.reducerConfig, reducerConfig)
    });
  }

  render() {
    let {isJSONModeActive} = this.props;

    let {appConfig, batch, reducerConfig} = this.state;
    let data = batch.reduce(
      ReducerUtil.combineReducers(reducerConfig),
      appConfig
    );

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
                  <ServiceFormSection data={data} onAddReducer={this.handleAddReducer} />
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
          <Ace editorProps={{$blockScrolling: true}}
            mode="json"
            onChange={this.handleJSONChange}
            showGutter={true}
            showPrintMargin={false}
            theme="monokai"
            height="100%"
            value={JSON.stringify(data, null, 2)}
            width="100%" />
        </div>
      </div>
    );
  }
}

NewCreateServiceModalForm.defaultProps = {
  data: {},
  onAddReducer() {},
  onChange() {}
};

NewCreateServiceModalForm.propTypes = {
  data: React.PropTypes.object,
  onAddReducer: React.PropTypes.func,
  onChange: React.PropTypes.func
};

module.exports = NewCreateServiceModalForm;

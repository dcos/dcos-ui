import Ace from 'react-ace';
import classNames from 'classnames';
import React from 'react';

import Tabs from '../../../../../../src/js/components/Tabs';
import TabButton from '../../../../../../src/js/components/TabButton';
import TabButtonList from '../../../../../../src/js/components/TabButtonList';
import TabView from '../../../../../../src/js/components/TabView';
import TabViewList from '../../../../../../src/js/components/TabViewList';

const METHODS_TO_BIND = ['handleJSONChange'];

class NewCreateServiceModalForm extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      jsonValue: ''
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleJSONChange(jsonValue) {
    this.setState({jsonValue});
  }

  render() {
    let {props} = this;
    let jsonEditorPlaceholderClasses = classNames(
      'modal-full-screen-side-panel-placeholder',
      {
        'is-visible': props.isJSONModeActive
      }
    );
    let jsonEditorClasses = classNames('modal-full-screen-side-panel', {
      'is-visible': props.isJSONModeActive
    });

    return (
      <div className="flex flex-item-grow-1">
        <div className="container flex flex-direction-top-to-bottom">
          <Tabs vertical={true}>
            <TabButtonList>
              <TabButton id="services" label="Services">
                <TabButton id="container-1" label="Container 1" />
                <TabButton id="container-2" label="Container 2" />
              </TabButton>
            </TabButtonList>
            <TabViewList>
              <TabView id="services">
                Services Content
              </TabView>
              <TabView id="container-1">
                Container 1 Content
              </TabView>
              <TabView id="container-2">
                Container 2 Content
              </TabView>
            </TabViewList>
          </Tabs>
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
            value={this.state.jsonValue}
            width="100%"/>
        </div>
      </div>
    );
  }
}

module.exports = NewCreateServiceModalForm;

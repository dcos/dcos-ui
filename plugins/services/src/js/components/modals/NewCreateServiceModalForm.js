import React from 'react';

import Tabs from '../../../../../../src/js/components/Tabs';
import TabButton from '../../../../../../src/js/components/TabButton';
import TabButtonList from '../../../../../../src/js/components/TabButtonList';
import TabView from '../../../../../../src/js/components/TabView';
import TabViewList from '../../../../../../src/js/components/TabViewList';

class NewCreateServiceModalForm extends React.Component {
  render() {
    return (
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
    );
  }
}

module.exports = NewCreateServiceModalForm;

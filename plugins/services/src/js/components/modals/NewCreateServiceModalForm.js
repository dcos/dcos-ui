import React from 'react';

import Tabs from '../Tabs';
import TabButton from '../TabButton';
import TabButtons from '../TabButtons';
import TabViews from '../TabViews';
import TabView from '../TabView';

class NewCreateServiceModalForm extends React.Component {
  render() {
    return (
      <Tabs vertical={true}>
        <TabButtons>
          <TabButton id="services" label="Services">
            <TabButton id="container-1" label="Container 1" />
            <TabButton id="container-2" label="Container 2" />
          </TabButton>
        </TabButtons>
        <TabViews>
          <TabView id="services">
            Services Content
          </TabView>
          <TabView id="container-1">
            Container 1 Content
          </TabView>
          <TabView id="container-2">
            Container 2 Content
          </TabView>
        </TabViews>
      </Tabs>
    );
  }
}

module.exports = NewCreateServiceModalForm;

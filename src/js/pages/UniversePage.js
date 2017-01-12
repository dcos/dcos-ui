import {MountService} from 'foundation-ui';
import React from 'react';

import CreateServiceModalUniversePanelOption from './universe/CreateServiceModalUniversePanelOption';
import Icon from '../components/Icon';

MountService.MountService.registerComponent(
  CreateServiceModalUniversePanelOption,
  'CreateService:ServicePicker:GridOptions'
);

class UniversePage extends React.Component {
  render() {
    return this.props.children;
  }
}

UniversePage.routeConfig = {
  label: 'Universe',
  icon: <Icon id="packages-inverse" size="small" family="product" />,
  matches: /^\/universe/
};

module.exports = UniversePage;

import {MountService} from 'foundation-ui';
import React from 'react';

import Icon from '../components/Icon';

const IntroductoryText = () => {
  return (
    <p className="lead tall">
      Create a containerized service or run a command in one of two ways: use our form to be guided through the correct configuration, or enter your JSON configuration directly. You may also <a href="#/universe">browse the package repository</a>.
    </p>
  );
};

MountService.MountService.registerComponent(
  IntroductoryText,
  'CreateService:ServicePicker:IntroductoryText'
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

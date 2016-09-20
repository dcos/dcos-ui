import React from 'react';

import DescriptionList from './DescriptionList';
import PodSpec from '../structs/PodSpec';
import Icon from './Icon';

const METHODS_TO_BIND = [
];

class PodSpecView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getEnvironmentDetails() {
    let {spec} = this.props;
    let environment = Object.assign({}, spec.getEnvironment());

    if (Object.keys(environment).length === 0) {
      return null;
    }

    Object.keys(environment).forEach(function (key) {
      let value = environment[key];
      if (typeof value === 'object' && !Array.isArray(value) &&
          value !== null) {
        environment[key] = (
          <span>
            <Icon
              className="icon-margin-right"
              color="white"
              family="mini"
              id="key"
              size="mini" /> {value.secret}
          </span>
        );
      }
    });

    return (
      <div>
        <h4 className="inverse flush-top">
          Environment variables
        </h4>
        <DescriptionList hash={environment} />
      </div>
    );
  }

  getGeneralDetails() {
    let {spec} = this.props;
    let hash = {
      'ID': spec.getId()
    };

    return <DescriptionList hash={hash} />;
  }

  render() {
    let {spec} = this.props;

    return (
      <div>
        <h4 className="inverse flush-top">
          General
        </h4>
        {this.getGeneralDetails()}
        {this.getEnvironmentDetails()}
      </div>
      );
  }
};

PodSpecView.contextTypes = {
  router: React.PropTypes.func
};

PodSpecView.propTypes = {
  spec: React.PropTypes.instanceOf(PodSpec)
};

module.exports = PodSpecView;

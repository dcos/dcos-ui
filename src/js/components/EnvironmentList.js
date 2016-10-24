import React from 'react';

import DescriptionList from './DescriptionList';
import Icon from './Icon';

class EnvironmentList extends React.Component {
  render() {
    let {environment} = this.props;

    if (!environment || Object.keys(environment).length === 0) {
      return null;
    }

    let hash = Object.keys(environment).reduce(function (memo, key) {
      let value = environment[key];

      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null
      ) {
        memo[key] = (
          <span>
            <Icon
              className="icon-margin-right"
              color="neutral"
              family="mini"
              id="key"
              size="mini" />
            {value.secret}
          </span>
        );
      }

      return memo;
    }, {});

    return <DescriptionList hash={hash} />;
  }
}

EnvironmentList.propTypes = {
  environment: React.PropTypes.object
};

module.exports = EnvironmentList;

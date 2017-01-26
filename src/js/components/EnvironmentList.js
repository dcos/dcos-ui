import React from 'react';

import HashMapDisplay from './HashMapDisplay';
import Icon from './Icon';

class EnvironmentList extends React.Component {
  render() {
    const {environment} = this.props;

    if (!environment || Object.keys(environment).length === 0) {
      return null;
    }

    const hash = Object.keys(environment).reduce(function (memo, key) {
      const value = environment[key];

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
              id="key"
              size="mini" />
            {value.secret}
          </span>
        );
      }

      return memo;
    }, {});

    return <HashMapDisplay hash={hash} />;
  }
}

EnvironmentList.propTypes = {
  environment: React.PropTypes.object
};

module.exports = EnvironmentList;

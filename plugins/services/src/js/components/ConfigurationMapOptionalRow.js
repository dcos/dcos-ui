import React from 'react';

import ConfigurationMapRow from '../../../../../src/js/components/ConfigurationMapRow';

/**
 * This is a high-order component around `<ConfigurationMapRow />` that shows
 * it only when `visibleIf` property is evaluated to something truthy or
 * non-empty
 *
 * Saves some time when composing a lot of optional rows.
 */
class ConfigurationMapOptionalRow extends React.Component {
  render() {
    let {visibleIf} = this.props;
    if (!visibleIf || ValidatorUtil.isEmpty(visibleIf)) {
      return null;
    }

    return (
      <ConfigurationMapRow>
        {this.props.children}
      </ConfigurationMapRow>
    );
  }
};

ConfigurationMapOptionalRow.defaultProps = {
  visibleIf: false
};

ConfigurationMapOptionalRow.propTypes = {
  visibleIf: React.PropTypes.any
};

module.exports = ConfigurationMapOptionalRow;

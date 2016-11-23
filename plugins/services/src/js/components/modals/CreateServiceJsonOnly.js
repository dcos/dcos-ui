import React, {PropTypes} from 'react';

class CreateServiceJsonOnly extends React.Component {
  render() {
    return (
      <div>JSON Editor Placeholder</div>
    );
  }
}

CreateServiceJsonOnly.defaultProps = {
  onChange() {},
  onErrorStateChange() {}
};

CreateServiceJsonOnly.propTypes = {
  onChange: PropTypes.func,
  onErrorStateChange: PropTypes.func,
  service: PropTypes.object
};

module.exports = CreateServiceJsonOnly;

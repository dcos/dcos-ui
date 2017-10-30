import React, { Component } from "react";

class ConfigurationMapToggleValue extends Component {
  constructor(props) {
    super(props);

    this.state = {
      toggled: false
    };
  }

  render() {
    const { toggled } = this.state;
    const { primaryValue, secondaryValue } = this.props;

    return (
      <div className="configuration-map-value">
        <span
          className="configuration-map-toggle-value"
          onClick={() => this.setState({ toggled: !toggled })}
        >
          {toggled ? secondaryValue : primaryValue}
        </span>
      </div>
    );
  }
}

ConfigurationMapToggleValue.propTypes = {
  primaryValue: React.PropTypes.string.isRequired,
  secondaryValue: React.PropTypes.string.isRequired
};

module.exports = ConfigurationMapToggleValue;

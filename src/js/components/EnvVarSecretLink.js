import React from 'react';
import Icon from './Icon';

class EnvVarSecretLink extends React.Component {
  render() {
    let {secret} = this.props;

    return (
      <a href={`#valut/${secret}`}>
        <Icon
          className="icon-margin-right"
            color="white"
            family="mini"
            id="key"
            size="mini" />
          {secret}
      </a>
    );
  }
};

EnvVarSecretLink.propTypes = {
  secret: React.PropTypes.string.isRequired
};

module.exports = EnvVarSecretLink;

import React from 'react';
import Icon from './Icon';

class KeyIconLink extends React.Component {
  render() {
    let {url, text} = this.props;

    return (
      <a href={url}>
        <Icon
          className="icon-margin-right"
            color="white"
            family="mini"
            id="key"
            size="mini" />
          {text}
      </a>
    );
  }
};

KeyIconLink.propTypes = {
  url: React.PropTypes.string.isRequired,
  text: React.PropTypes.string.isRequired
};

module.exports = KeyIconLink;

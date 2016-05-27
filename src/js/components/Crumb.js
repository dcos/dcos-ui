import {Link} from 'react-router';
import React, {PropTypes} from 'react';

class Crumb extends React.Component {
  render() {
    let {props} = this;
    let content = props.label;

    if (props.route) {
      content = (
        <Link to={props.route.to}
            params={props.route.params}
            title={props.label}>
          {props.label}
        </Link>
      );
    }

    return content;
  }
};

Crumb.propTypes = {
  label: PropTypes.string.isRequired,
  route: PropTypes.object
};

module.exports = Crumb;

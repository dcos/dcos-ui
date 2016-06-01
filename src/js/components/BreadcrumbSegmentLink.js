import {Link} from 'react-router';
import React, {PropTypes} from 'react';

class BreadcrumbSegmentLink extends React.Component {
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
    } else {
      content = (
        <span>{content}</span>
      );
    }

    return content;
  }
};

BreadcrumbSegmentLink.propTypes = {
  label: PropTypes.string.isRequired,
  route: PropTypes.object
};

module.exports = BreadcrumbSegmentLink;

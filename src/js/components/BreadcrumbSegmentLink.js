/* @flow */
import { Link, formatPattern } from "react-router";
import React, { PropTypes } from "react";

type Props = {
  label: string,
  route?: Object
};

class BreadcrumbSegmentLink extends React.Component {

  render() {
    const { props } = this;
    const content = props.label;

    if (props.route) {
      const { to, params } = props.route;

      return (
        <Link
          className={props.className}
          to={formatPattern(to, params)}
          title={content}
        >
          {content}
        </Link>
      );
    } else if (props.onClick) {
      return (
        <a className={props.className} onClick={props.onClick} title={content}>
          {content}
        </a>
      );
    } else {
      return <span>{content}</span>;
    }
  }
}

module.exports = BreadcrumbSegmentLink;

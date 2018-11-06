import { Link, formatPattern } from "react-router";
import PropTypes from "prop-types";
import React from "react";
import { Trans } from "@lingui/macro";

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
          <Trans render="span" id={content} />
        </Link>
      );
    } else if (props.onClick) {
      return (
        <a className={props.className} onClick={props.onClick} title={content}>
          <Trans render="span" id={content} />
        </a>
      );
    } else {
      return <span>{content}</span>;
    }
  }
}

BreadcrumbSegmentLink.propTypes = {
  label: PropTypes.string.isRequired,
  route: PropTypes.object
};

module.exports = BreadcrumbSegmentLink;

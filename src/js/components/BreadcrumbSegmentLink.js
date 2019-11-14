import { Link, formatPattern } from "react-router";
import React from "react";
import { Trans } from "@lingui/macro";

const BreadcrumbSegmentLink = ({ label, route, className, onClick }) => {
  if (route) {
    const to = formatPattern(route.to, route.params);
    return (
      <Link className={className} to={to} title={label}>
        <Trans render="span" id={label} />
      </Link>
    );
  }
  if (onClick) {
    return (
      <a className={className} onClick={onClick} title={label}>
        <Trans render="span" id={label} />
      </a>
    );
  }
  return <span>{label}</span>;
};

module.exports = BreadcrumbSegmentLink;

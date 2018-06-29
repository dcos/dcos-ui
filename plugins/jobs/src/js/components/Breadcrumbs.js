import { Link } from "react-router";
import PropTypes from "prop-types";
import React from "react";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import PageHeaderBreadcrumbs from "#SRC/js/components/PageHeaderBreadcrumbs";

export default function Breadcrumbs({ item, children, states }) {
  function getBreadcrumb(item, id = "", name = "") {
    const isDetailPage = [...item.path, item.name].join(".") === id;
    const link = isDetailPage ? `/jobs/detail/${id}` : `/jobs/overview/${id}`;

    return (
      <Breadcrumb key={id} title="Jobs">
        <BreadcrumbTextContent>
          <Link to={link}>{name === "" ? "Jobs" : name}</Link>
        </BreadcrumbTextContent>

        {isDetailPage ? states : null}
      </Breadcrumb>
    );
  }

  function getBreadcrumbList(item) {
    if (item == null) {
      return [];
    }

    const pathSegments = [...item.path, item.name];
    const segments = pathSegments.map((_, index) =>
      pathSegments.slice(0, index + 1)
    );

    return segments.map(segment =>
      getBreadcrumb(item, segment.join("."), segment[segment.length - 1])
    );
  }

  let breadcrumbs = [];

  if (item) {
    breadcrumbs = [].concat(
      getBreadcrumb(item),
      getBreadcrumbList(item),
      React.Children.toArray(children)
    );
  }

  return <PageHeaderBreadcrumbs iconID="jobs" breadcrumbs={breadcrumbs} />;
}

Breadcrumbs.propTypes = {
  states: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element)
  ]),
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    path: PropTypes.arrayOf(PropTypes.string).isRequired
  }).isRequired
};

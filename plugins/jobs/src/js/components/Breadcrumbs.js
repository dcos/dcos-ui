import { Link } from "react-router";
import PropTypes from "prop-types";
import React from "react";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import PageHeaderBreadcrumbs from "#SRC/js/components/PageHeaderBreadcrumbs";

export default function Breadcrumbs({ path, name, children, extra }) {
  /**
   * @param  {string} link
   * @param  {string[]} pathname path including name (if given)
   * @param  {JSX.Element} [extra=null] extra JSX Components to render
   *
   * @return {JSX.Element} Breadcrumb Part Component
   */
  function buildJSX(link, pathname, extra = null) {
    return (
      <Breadcrumb key={pathname.join(".")} title="Jobs">
        <BreadcrumbTextContent>
          <Link to={link}>{pathname.slice(-1)}</Link>
        </BreadcrumbTextContent>

        {extra}
      </Breadcrumb>
    );
  }

  // we're starting from the back, so first we have children
  let breadcrumbs = React.Children.toArray(children);

  // if we got a name, thats a detail link
  if (name !== undefined && name !== "") {
    breadcrumbs = [
      buildJSX(
        ["/jobs/detail/"].concat(path, [name]).join("."),
        path.concat([name]),
        extra
      )
    ].concat(breadcrumbs);
  }

  // build up breadcrumb for path, starting from the end!
  if (path !== undefined) {
    for (let index = path.length; index > 0; index--) {
      breadcrumbs = [
        buildJSX(
          ["/jobs/overview/"].concat(path.slice(0, index)).join("."),
          path.slice(0, index)
        )
      ].concat(breadcrumbs);
    }
  }

  // add root element, here its named "Jobs"
  breadcrumbs = [buildJSX("/jobs/overview/", ["Jobs"])].concat(breadcrumbs);

  return <PageHeaderBreadcrumbs iconID="jobs" breadcrumbs={breadcrumbs} />;
}

Breadcrumbs.propTypes = {
  extra: PropTypes.node,
  name: PropTypes.string,
  path: PropTypes.arrayOf(PropTypes.string)
};

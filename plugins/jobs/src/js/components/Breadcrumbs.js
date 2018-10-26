import { Trans } from "@lingui/macro";
import { Link } from "react-router";
import PropTypes from "prop-types";
import React from "react";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import PageHeaderBreadcrumbs from "#SRC/js/components/PageHeaderBreadcrumbs";

export default function Breadcrumbs({ jobPath, jobName, jobInfo, children }) {
  let breadcrumbParts = [
    <Breadcrumb key={"Jobs"} title="Jobs">
      <BreadcrumbTextContent>
        <Trans render={<Link to={"/jobs/overview/"} />}>Jobs</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  if (jobPath !== undefined) {
    const pathParts = jobPath.map((jobPathPart, index) => {
      const partId = jobPath.slice(0, index + 1).join(".");

      return (
        <Breadcrumb key={jobPathPart} title="Jobs">
          <BreadcrumbTextContent>
            <Link to={"/jobs/overview/" + partId}>{jobPathPart}</Link>
          </BreadcrumbTextContent>
        </Breadcrumb>
      );
    });
    breadcrumbParts = breadcrumbParts.concat(pathParts);
  }

  if (jobName !== undefined) {
    const partId = jobPath.concat([jobName]).join(".");
    breadcrumbParts = breadcrumbParts.concat([
      <Breadcrumb key={jobName} title="Jobs">
        <BreadcrumbTextContent>
          <Link to={"/jobs/detail/" + partId}>{jobName}</Link>
        </BreadcrumbTextContent>
        {jobInfo}
      </Breadcrumb>
    ]);
  }

  if (children !== undefined) {
    breadcrumbParts = breadcrumbParts.concat(React.Children.toArray(children));
  }

  return <PageHeaderBreadcrumbs iconID="jobs" breadcrumbs={breadcrumbParts} />;
}

Breadcrumbs.propTypes = {
  jobInfo: PropTypes.node,
  jobName: PropTypes.string,
  jobPath: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node
};

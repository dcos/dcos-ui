import { Trans } from "@lingui/react";
import { Link } from "react-router";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import PageHeaderBreadcrumbs from "#SRC/js/components/PageHeaderBreadcrumbs";

type Props = {
  jobInfo?: unknown;
  jobPath?: string[];
  jobName?: string;
  children?: React.ReactNode[];
};
export default ({ jobInfo, jobPath = [], jobName, children }: Props) => {
  let breadcrumbParts: React.ReactNode[] = [
    <Breadcrumb key={"Jobs"} title="Jobs">
      <BreadcrumbTextContent>
        <Trans render={<Link to={"/jobs/overview/"} />} id="Jobs" />
      </BreadcrumbTextContent>
    </Breadcrumb>,
  ];

  breadcrumbParts = breadcrumbParts.concat(
    jobPath.map((jobPathPart, index) => (
      <Breadcrumb key={jobPathPart} title="Jobs">
        <BreadcrumbTextContent>
          <Link to={"/jobs/overview/" + jobPath.slice(0, index + 1).join(".")}>
            {jobPathPart}
          </Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    ))
  );

  if (jobName !== undefined) {
    const partId = jobPath.concat([jobName]).join(".");
    breadcrumbParts = breadcrumbParts.concat([
      <Breadcrumb key={jobName} title="Jobs">
        <BreadcrumbTextContent>
          <Link to={"/jobs/detail/" + partId}>{jobName}</Link>
        </BreadcrumbTextContent>
        {jobInfo}
      </Breadcrumb>,
    ]);
  }

  if (children !== undefined) {
    breadcrumbParts = breadcrumbParts.concat(React.Children.toArray(children));
  }

  return (
    <PageHeaderBreadcrumbs
      iconID={ProductIcons.Jobs}
      breadcrumbs={breadcrumbParts}
    />
  );
};

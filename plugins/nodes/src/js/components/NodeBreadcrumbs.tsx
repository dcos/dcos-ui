import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import PageHeaderBreadcrumbs from "#SRC/js/components/PageHeaderBreadcrumbs";
import UnitHealthStore from "#SRC/js/stores/UnitHealthStore";

const NodeBreadcrumbs = ({ node, taskID, taskName, unitID }) => {
  const crumbs = [
    <Breadcrumb key={-1} title="Nodes">
      <BreadcrumbTextContent>
        <Trans render={<Link to="/nodes" key={-1} />}>Nodes</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  if (node) {
    const encodedNodeID = node.getEncodedID();
    crumbs.push(
      <Breadcrumb key="hostname" title={node.hostname}>
        <BreadcrumbTextContent>
          <Link to={`/nodes/${encodedNodeID}`}>{node.hostname}</Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    );

    if (taskID != null && taskName != null) {
      const encodedTaskID = encodeURIComponent(taskID);
      crumbs.push(
        <Breadcrumb key="task-name" title={taskName}>
          <BreadcrumbTextContent>
            <Link to={`/nodes/${encodedNodeID}/tasks/${encodedTaskID}`}>
              {taskName}
            </Link>
          </BreadcrumbTextContent>
        </Breadcrumb>
      );
    }

    if (unitID != null) {
      const unit = UnitHealthStore.getUnit(unitID);
      const healthStatus = UnitHealthStore.getNode(node.hostname).getHealth();
      const unitTitle = unit.getTitle();

      crumbs.push(
        <Breadcrumb key="unit-health" title={unitTitle}>
          <BreadcrumbTextContent>
            <Link
              to={`/nodes/${encodedNodeID}/health/${node.hostname}/${unit.get(
                "id"
              )}`}
              key={-1}
            >
              {`${unitTitle} `}
              <span className={healthStatus.classNames}>
                ({healthStatus.title})
              </span>
            </Link>
          </BreadcrumbTextContent>
        </Breadcrumb>
      );
    }
  }

  return (
    <PageHeaderBreadcrumbs iconID={ProductIcons.Servers} breadcrumbs={crumbs} />
  );
};

NodeBreadcrumbs.propTypes = {
  node: PropTypes.object,
  taskID: PropTypes.string,
  taskName: PropTypes.string,
  unitID: PropTypes.string
};

export default NodeBreadcrumbs;

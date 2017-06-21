import React from "react";
import { Link } from "react-router";

import Breadcrumb from "../../../../../src/js/components/Breadcrumb";
import BreadcrumbTextContent
  from "../../../../../src/js/components/BreadcrumbTextContent";
import CompositeState from "../../../../../src/js/structs/CompositeState";
import PageHeaderBreadcrumbs
  from "../../../../../src/js/components/PageHeaderBreadcrumbs";
import UnitHealthStore from "../../../../../src/js/stores/UnitHealthStore";

const NodeBreadcrumbs = ({ nodeID, taskID, taskName, unitID }) => {
  const trimmedNodeID = decodeURIComponent(nodeID).replace(/^\//, "");
  const encodedNodeID = encodeURIComponent(trimmedNodeID);
  const crumbs = [
    <Breadcrumb key={-1} title="Nodes">
      <BreadcrumbTextContent>
        <Link to="/nodes" key={-1}>Nodes</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];
  let node;

  if (nodeID != null && trimmedNodeID.length > 0) {
    node = CompositeState.getNodesList().filter({ ids: [nodeID] }).last();
    crumbs.push(
      <Breadcrumb key="hostname" title={node.hostname}>
        <BreadcrumbTextContent>
          <Link to={`/nodes/${encodedNodeID}`}>{node.hostname}</Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    );
  }

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
            to={`/nodes/${encodedNodeID}/health/${node.hostname}/${unit.get("id")}`}
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

  return <PageHeaderBreadcrumbs iconID="servers" breadcrumbs={crumbs} />;
};

module.exports = NodeBreadcrumbs;

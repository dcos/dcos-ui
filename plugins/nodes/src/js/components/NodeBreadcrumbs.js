import React from 'react';
import {Link} from 'react-router';

import CompositeState from '../../../../../src/js/structs/CompositeState';
import PageHeaderBreadcrumbs from '../../../../../src/js/components/NewPageHeaderBreadcrumbs';
import UnitHealthStore from '../../../../../src/js/stores/UnitHealthStore';

const NodeBreadcrumbs = ({nodeID, taskID, taskName, unitID}) => {
  const trimmedNodeID = decodeURIComponent(nodeID).replace(/^\//, '');
  const encodedNodeID = encodeURIComponent(trimmedNodeID);
  const crumbs = [
    <Link to="/nodes" key={-1}>Nodes</Link>
  ];
  let node;

  if (nodeID != null && trimmedNodeID.length > 0) {
    node = CompositeState.getNodesList().filter(
        {ids: [nodeID]}
    ).last();
    crumbs.push(
      <Link to={`/nodes/${encodedNodeID}`}>{node.hostname}</Link>
    );
  }

  if (taskID != null && taskName != null) {
    const encodedTaskID = encodeURIComponent(taskID);
    crumbs.push(
      <Link to={`/nodes/${encodedNodeID}/tasks/${encodedTaskID}`}>
        {taskName}
      </Link>
    );
  }

  if (unitID != null) {
    const unit = UnitHealthStore.getUnit(unitID);
    const healthStatus = UnitHealthStore.getNode(node.hostname).getHealth();
    const unitTitle = unit.getTitle();

    crumbs.push(
      <Link to={`/nodes/${encodedNodeID}/health/${node.hostname}/${unit.get('id')}`} key={-1}>
        {`${unitTitle} `}
        <span className={healthStatus.classNames}>
          ({healthStatus.title})
        </span>
      </Link>
    );
  }

  return <PageHeaderBreadcrumbs iconID="servers" breadcrumbs={crumbs} />;

};

module.exports = NodeBreadcrumbs;

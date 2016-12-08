import React from 'react';
import {Link} from 'react-router';

import CompositeState from '../../../../../src/js/structs/CompositeState';
import PageHeaderBreadcrumbs from '../../../../../src/js/components/NewPageHeaderBreadcrumbs';

const NodeBreadcrumbs = ({nodeID, taskID, taskName}) => {
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
    let encodedTaskID = encodeURIComponent(taskID);
    crumbs.push(
      <Link to={`/nodes/${encodedNodeID}/tasks/${encodedTaskID}`}>
        {taskName}
      </Link>
    );
  }

  return <PageHeaderBreadcrumbs iconID="servers" breadcrumbs={crumbs} />;

};

module.exports = NodeBreadcrumbs;

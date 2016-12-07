import React from 'react';
import {Link} from 'react-router';

import PageHeaderBreadcrumbs from '../../../../../src/js/components/NewPageHeaderBreadcrumbs';

const NodeBreadcrumbs = ({nodeID, taskID, taskName}) => {
  const trimmednodeID = decodeURIComponent(nodeID).replace(/^\//, '');
  const encodedNodeID = encodeURIComponent(trimmednodeID);
  const crumbs = [<Link to="nodes" key={-1}>Nodes</Link>];

  if (nodeID != null && trimmednodeID.length > 0) {
    crumbs.push(
      <Link to={`/nodes/${encodedNodeID}`}>{nodeID}</Link>
    );
  }

  if (taskID != null && taskName != null) {
    let encodedTaskID = encodeURIComponent(taskID);
    crumbs.push(
      <Link to={`nodes/${encodedNodeID}/tasks/${encodedTaskID}`}>
        {taskName}
      </Link>
    );
  }

  return <PageHeaderBreadcrumbs iconID="servers" breadcrumbs={crumbs} />;

};

module.exports = NodeBreadcrumbs;

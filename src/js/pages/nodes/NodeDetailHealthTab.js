import React from 'react';

import Node from '../../structs/Node';
import NodeHealthStore from '../../stores/NodeHealthStore';
import HealthTab from '../../components/HealthTab';

class NodeDetailHealthTab extends React.Component {
  render() {
    let {node} = this.props;
    let units = NodeHealthStore.getUnits(node.hostname);

    return (
      <div className="container container-fluid flush">
        <HealthTab
          node={node}
          units={units}
          parentRouter={this.context.router} />
      </div>
    );
  }
}

NodeDetailHealthTab.contextTypes = {
  router: React.PropTypes.func
};

NodeDetailHealthTab.propTypes = {
  node: React.PropTypes.instanceOf(Node).isRequired
};

module.exports = NodeDetailHealthTab;

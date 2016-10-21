import React from 'react';

import Node from '../../../../../../src/js/structs/Node';
import NodeHealthStore from '../../stores/NodeHealthStore';
import HealthTab from '../../components/HealthTab';

class NodeDetailHealthTab extends React.Component {
  render() {
    let {node} = this.props;
    let units = NodeHealthStore.getUnits(node.hostname);

    return (
      <HealthTab
        node={node}
        units={units}
        parentRouter={{params: this.props.params}} />
    );
  }
}

NodeDetailHealthTab.contextTypes = {
  router: React.PropTypes.object
};

NodeDetailHealthTab.propTypes = {
  node: React.PropTypes.instanceOf(Node).isRequired
};

module.exports = NodeDetailHealthTab;

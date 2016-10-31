import React from 'react';
import {routerShape} from 'react-router';

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
        params={this.props.params} />
    );
  }
}

NodeDetailHealthTab.contextTypes = {
  router: routerShape
};

NodeDetailHealthTab.propTypes = {
  node: React.PropTypes.instanceOf(Node).isRequired
};

module.exports = NodeDetailHealthTab;

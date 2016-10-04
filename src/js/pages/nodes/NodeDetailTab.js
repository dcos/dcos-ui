import React from 'react';

import DateUtil from '../../utils/DateUtil';
import DescriptionList from '../../components/DescriptionList';
import MesosStateStore from '../../stores/MesosStateStore';
import Node from '../../structs/Node';
import StringUtil from '../../utils/StringUtil';

class NodeDetailTab extends React.Component {
  render() {
    let {node} = this.props;

    let headerValueMapping = {
      ID: node.id,
      Active: StringUtil.capitalize(node.active.toString().toLowerCase()),
      Registered: DateUtil.msToDateStr(
        node.registered_time.toFixed(3) * 1000
      ),
      'Master Version': MesosStateStore.get('lastMesosState').version
    };

    return (
      <div>
        <DescriptionList
          className="pod pod-short flush-top flush-right flush-left"
          hash={headerValueMapping} />
        <DescriptionList
          className="pod pod-short flush-top flush-right flush-left"
          hash={node.attributes}
          headline="Attributes" />
      </div>
    );
  }
}

NodeDetailTab.propTypes = {
  node: React.PropTypes.instanceOf(Node).isRequired
};

module.exports = NodeDetailTab;

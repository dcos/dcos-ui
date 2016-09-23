import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';

import DateUtil from '../../utils/DateUtil';
import DescriptionList from '../../components/DescriptionList';
import MesosStateStore from '../../stores/MesosStateStore';
import Node from '../../structs/Node';
import StringUtil from '../../utils/StringUtil';

class NodeDetailTab extends React.Component {
  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate;
  }

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
      <div className="container container-fluid flush">
        <DescriptionList
          className="container container-fluid flush container-pod container-pod-super-short flush-top"
          hash={headerValueMapping} />
        <DescriptionList
          className="container container-fluid flush container-pod container-pod-super-short flush-top"
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

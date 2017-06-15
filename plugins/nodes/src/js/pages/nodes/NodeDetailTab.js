import PureRender from "react-addons-pure-render-mixin";
import React from "react";

import ConfigurationMap
  from "../../../../../../src/js/components/ConfigurationMap";
import ConfigurationMapHeading
  from "../../../../../../src/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel
  from "../../../../../../src/js/components/ConfigurationMapLabel";
import ConfigurationMapRow
  from "../../../../../../src/js/components/ConfigurationMapRow";
import ConfigurationMapSection
  from "../../../../../../src/js/components/ConfigurationMapSection";
import ConfigurationMapValue
  from "../../../../../../src/js/components/ConfigurationMapValue";
import DateUtil from "../../../../../../src/js/utils/DateUtil";
import HashMapDisplay from "../../../../../../src/js/components/HashMapDisplay";
import MesosStateStore from "../../../../../../src/js/stores/MesosStateStore";
import Node from "../../../../../../src/js/structs/Node";
import StringUtil from "../../../../../../src/js/utils/StringUtil";
import Units from "../../../../../../src/js/utils/Units";

class NodeDetailTab extends React.Component {
  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
  }

  render() {
    const { node } = this.props;
    const resources = node.get("resources");

    return (
      <div className="container">
        <ConfigurationMap>
          <ConfigurationMapSection>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                ID
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {node.id}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Active
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {StringUtil.capitalize(node.active.toString().toLowerCase())}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Registered
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {DateUtil.msToDateStr(node.registered_time.toFixed(3) * 1000)}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Master Version
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {MesosStateStore.get("lastMesosState").version}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
          <HashMapDisplay hash={node.attributes} headline="Attributes" />
          <ConfigurationMapSection>
            <ConfigurationMapHeading>
              Resources
            </ConfigurationMapHeading>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Disk
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {Units.formatResource("disk", resources.disk)}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                Mem
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {Units.formatResource("mem", resources.mem)}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                CPUs
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {Units.formatResource("cpus", resources.cpus)}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
        </ConfigurationMap>
      </div>
    );
  }
}

NodeDetailTab.propTypes = {
  node: React.PropTypes.instanceOf(Node).isRequired
};

module.exports = NodeDetailTab;

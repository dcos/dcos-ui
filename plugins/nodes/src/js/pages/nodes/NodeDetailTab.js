import { Trans } from "@lingui/macro";
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { request } from "@dcos/mesos-client";

import { MESOS_STATE_CHANGE } from "#SRC/js/constants/EventTypes";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import CompositeState from "#SRC/js/structs/CompositeState";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import DateUtil from "#SRC/js/utils/DateUtil";
import HashMapDisplay from "#SRC/js/components/HashMapDisplay";
import Node from "#SRC/js/structs/Node";
import StringUtil from "#SRC/js/utils/StringUtil";
import Units from "#SRC/js/utils/Units";
import Loader from "#SRC/js/components/Loader";

class NodeDetailTab extends PureComponent {
  constructor() {
    super(...arguments);

    this.onMesosStateChange = this.onMesosStateChange.bind(this);

    this.state = {
      masterRegion: null
    };
  }

  componentDidMount() {
    MesosStateStore.addChangeListener(
      MESOS_STATE_CHANGE,
      this.onMesosStateChange
    );
    request({ type: "GET_VERSION" }).subscribe(response => {
      const { version = null } = JSON.parse(response).get_version.version_info;

      this.setState({ version });
    });

    this.onMesosStateChange();
  }

  componentWillUnmount() {
    MesosStateStore.removeChangeListener(
      MESOS_STATE_CHANGE,
      this.onMesosStateChange
    );
  }

  onMesosStateChange() {
    this.setState({
      masterRegion: CompositeState.getMasterNode().getRegionName()
    });
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
                <Trans render="span">ID</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>{node.id}</ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                <Trans render="span">Active</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {StringUtil.capitalize(node.active.toString().toLowerCase())}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                <Trans render="span">Registered</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {DateUtil.msToDateStr(node.registered_time.toFixed(3) * 1000)}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                <Trans render="span">Master Version</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {this.state.version || <Loader size="small" type="ballBeat" />}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                <Trans render="span">Region</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {node.getRegionName()}
                {this.state.masterRegion === node.getRegionName()
                  ? " (Local)"
                  : null}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                <Trans render="span">Zone</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {node.getZoneName()}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
          <HashMapDisplay hash={node.attributes} headline="Attributes" />
          <ConfigurationMapSection>
            <ConfigurationMapHeading>
              <Trans render="span">Resources</Trans>
            </ConfigurationMapHeading>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                <Trans render="span">Disk</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {Units.formatResource("disk", resources.disk)}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                <Trans render="span">Mem</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {Units.formatResource("mem", resources.mem)}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                <Trans render="span">CPUs</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {Units.formatResource("cpus", resources.cpus)}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
            <ConfigurationMapRow>
              <ConfigurationMapLabel>
                <Trans render="span">GPUs</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {Units.formatResource("gpus", resources.gpus)}
              </ConfigurationMapValue>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
        </ConfigurationMap>
      </div>
    );
  }
}

NodeDetailTab.propTypes = {
  node: PropTypes.instanceOf(Node).isRequired
};

module.exports = NodeDetailTab;

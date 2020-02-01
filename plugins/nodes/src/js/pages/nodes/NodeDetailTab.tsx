import { Trans, DateFormat } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";
import { request } from "@dcos/mesos-client";
import { Icon } from "@dcos/ui-kit";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import { MESOS_STATE_CHANGE } from "#SRC/js/constants/EventTypes";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import CompositeState from "#SRC/js/structs/CompositeState";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import HashMapDisplay from "#SRC/js/components/HashMapDisplay";
import Node from "#SRC/js/structs/Node";
import StringUtil from "#SRC/js/utils/StringUtil";
import DateUtil from "#SRC/js/utils/DateUtil";
import Units from "#SRC/js/utils/Units";
import Loader from "#SRC/js/components/Loader";
import { Status } from "../../types/Status";

class NodeDetailTab extends React.PureComponent {
  static propTypes = {
    node: PropTypes.instanceOf(Node)
  };
  constructor(...args) {
    super(...args);

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
    request({ type: "GET_VERSION" }, "/mesos/api/v1?GET_VERSION").subscribe(
      response => {
        const { version = null } = JSON.parse(
          response
        ).get_version.version_info;
        this.setState({ version });
      }
    );

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
    if (!node) {
      return null;
    }
    const resources = node.get("resources");
    const status = Status.fromNode(node);

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
                <Trans render="span">Registered</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                {node.registered_time ? (
                  <DateFormat
                    value={new Date(node.registered_time.toFixed(3) * 1000)}
                    format={DateUtil.getFormatOptions("longMonthDateTime")}
                  />
                ) : null}
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
              <Trans render="span">Status</Trans>
            </ConfigurationMapHeading>
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
                <Trans render="span">Status</Trans>
              </ConfigurationMapLabel>
              <ConfigurationMapValue>
                <span>
                  <Icon {...status.icon} size={iconSizeXs} />
                  <span style={{ marginLeft: "7px" }}>
                    {status.displayName}
                  </span>
                </span>
              </ConfigurationMapValue>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
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

export default NodeDetailTab;

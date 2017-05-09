import mixin from "reactjs-mixin";
import { Link } from "react-router";
import { MountService } from "foundation-ui";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";
import { FormattedMessage } from "react-intl";
import moment from "moment";

import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import Config from "../../config/Config";
import ConfigStore from "../../stores/ConfigStore";
import ConfigurationMap from "../../components/ConfigurationMap";
import ConfigurationMapHeading from "../../components/ConfigurationMapHeading";
import ConfigurationMapLabel from "../../components/ConfigurationMapLabel";
import ConfigurationMapRow from "../../components/ConfigurationMapRow";
import ConfigurationMapSection from "../../components/ConfigurationMapSection";
import ConfigurationMapValue from "../../components/ConfigurationMapValue";
import { findNestedPropertyInObject } from "../../utils/Util";
import HashMapDisplay from "../../components/HashMapDisplay";
import Loader from "../../components/Loader";
import MarathonStore
  from "../../../../plugins/services/src/js/stores/MarathonStore";
import MetadataStore from "../../stores/MetadataStore";
import MesosStateStore from "../../stores/MesosStateStore";
import Page from "../../components/Page";
import VersionsModal from "../../components/modals/VersionsModal";
import { isEmpty } from "../../utils/ValidatorUtil";

const METHODS_TO_BIND = [
  "handleClusterConfigModalClose",
  "handleClusterConfigModalOpen"
];

const SystemOverviewBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Cluster">
      <BreadcrumbTextContent>
        <Link to="/overview">Overview</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="cluster" breadcrumbs={crumbs} />;
};

class OverviewDetailTab extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      isClusterBuildInfoOpen: false
    };

    this.store_listeners = [
      {
        name: "config",
        events: ["ccidSuccess"]
      },
      {
        name: "marathon",
        events: ["instanceInfoSuccess"]
      },
      {
        name: "metadata",
        events: ["dcosBuildInfoChange", "dcosSuccess", "success"]
      },
      {
        name: "state",
        events: ["success"],
        listenAlways: false
      }
    ];

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);

    ConfigStore.fetchCCID();
    MarathonStore.fetchMarathonInstanceInfo();
    MetadataStore.fetchDCOSBuildInfo();
  }

  handleClusterConfigModalOpen() {
    this.setState({ isClusterBuildInfoOpen: true });
  }

  handleClusterConfigModalClose() {
    this.setState({ isClusterBuildInfoOpen: false });
  }

  getLoading() {
    return <Loader size="small" type="ballBeat" />;
  }

  getClusterDetails() {
    let ccid = ConfigStore.get("ccid");
    let publicIP = this.getPublicIP();
    let productVersion = MetadataStore.version;

    if (Object.keys(ccid).length) {
      ccid = ccid.zbase32_public_key;
    } else {
      ccid = this.getLoading();
    }

    if (productVersion == null) {
      productVersion = this.getLoading();
    }

    if (publicIP == null) {
      publicIP = this.getLoading();
    }

    return (
      <ConfigurationMapSection>
        <ConfigurationMapRow key="version">
          <ConfigurationMapLabel>
            {Config.productName} Version
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {productVersion}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="ccid">
          <ConfigurationMapLabel>
            Cryptographic Cluster ID
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {ccid}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="publicIP">
          <ConfigurationMapLabel>
            Public IP
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {publicIP}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  getMarathonDetailsHash() {
    const marathonDetails = MarathonStore.getInstanceInfo();

    if (!Object.keys(marathonDetails).length) {
      return null;
    }

    return {
      "Marathon Details": {
        Version: marathonDetails.version,
        "Framework ID": marathonDetails.frameworkId,
        Leader: marathonDetails.leader,
        "Marathon Config": marathonDetails.marathon_config,
        "ZooKeeper Config": marathonDetails.zookeeper_config
      }
    };
  }

  getPageHeaderActions() {
    return [
      {
        label: "View Cluster Configuration",
        onItemSelect: this.handleClusterConfigModalOpen
      }
    ];
  }

  getPublicIP() {
    const publicIP = findNestedPropertyInObject(
      MetadataStore.get("metadata"),
      "PUBLIC_IPV4"
    );

    if (!publicIP) {
      return null;
    }

    return publicIP;
  }

  /**
   * Get user if existent otherwise
   * return null
   *
   * @param {String} mesosBuildUser
   * @returns {Component|Null} User string or null
   *
   * @memberOf OverviewDetailTab
   */
  getMesosBuildUser(mesosBuildUser) {
    if (isEmpty(mesosBuildUser)) {
      return null;
    } else {
      return (
        <FormattedMessage
          id="COMMON.BY_NAME"
          values={{
            name: mesosBuildUser
          }}
        />
      );
    }
  }

  /**
   * Build Mesos details
   *
   * @returns {Component} Mesos details component
   *
   * @memberOf OverviewDetailTab
   */
  getMesosDetails() {
    const mesosConfig = MesosStateStore.get("lastMesosState");
    const mesosCluster = mesosConfig.cluster || this.getLoading();
    const mesosLeaderInfo = mesosConfig.leader_info || this.getLoading();
    const mesosVersion = mesosConfig.version || this.getLoading();
    const mesosBuilt = mesosConfig.build_time || this.getLoading();
    const mesosStarted = mesosConfig.start_time || this.getLoading();
    const mesosElected = mesosConfig.elected_time || this.getLoading();
    const mesosBuildUser = mesosConfig.build_user;

    return (
      <ConfigurationMapSection>
        <ConfigurationMapRow key="cluster">
          <ConfigurationMapLabel>
            <FormattedMessage id="COMMON.CLUSTER" />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {mesosCluster}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="leader">
          <ConfigurationMapLabel>
            <FormattedMessage id="COMMON.LEADER" />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {mesosLeaderInfo.hostname}:{mesosLeaderInfo.port}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="version">
          <ConfigurationMapLabel>
            <FormattedMessage id="COMMON.VERSION" />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {mesosVersion}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="built">
          <ConfigurationMapLabel>
            <FormattedMessage id="COMMON.BUILT" />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {moment(mesosBuilt * 1000).fromNow()}
            {" "}
            {this.getMesosBuildUser(mesosBuildUser)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="started">
          <ConfigurationMapLabel>
            <FormattedMessage id="COMMON.STARTED" />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {moment(mesosStarted * 1000).fromNow()}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="elected">
          <ConfigurationMapLabel>
            <FormattedMessage id="COMMON.ELECTED" />
          </ConfigurationMapLabel>
          <ConfigurationMapValue>
            {moment(mesosElected * 1000).fromNow()}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
      </ConfigurationMapSection>
    );
  }

  render() {
    const buildInfo = MetadataStore.get("dcosBuildInfo");
    const marathonHash = this.getMarathonDetailsHash();
    let marathonDetails = null;
    let versionsModal = null;

    if (marathonHash) {
      marathonDetails = <HashMapDisplay hash={marathonHash} />;
    }

    if (buildInfo != null) {
      versionsModal = (
        <VersionsModal
          onClose={this.handleClusterConfigModalClose}
          open={this.state.isClusterBuildInfoOpen}
          versionDump={buildInfo}
        />
      );
    }

    return (
      <Page>
        <Page.Header
          actions={this.getPageHeaderActions()}
          breadcrumbs={<SystemOverviewBreadcrumbs />}
        />
        <div className="container">
          <ConfigurationMap>
            <ConfigurationMapHeading className="flush-top">
              Cluster <FormattedMessage id="COMMON.DETAILS" />
            </ConfigurationMapHeading>
            <ConfigurationMapHeading level={2}>
              <FormattedMessage id="COMMON.GENERAL" />
            </ConfigurationMapHeading>
            {this.getClusterDetails()}
            <ConfigurationMapHeading level={2}>
              Mesos <FormattedMessage id="COMMON.DETAILS" />
            </ConfigurationMapHeading>
            {this.getMesosDetails()}
            {marathonDetails}
            <MountService.Mount type="OverviewDetailTab:AdditionalClusterDetails" />
          </ConfigurationMap>
        </div>
        {versionsModal}
      </Page>
    );
  }
}

OverviewDetailTab.routeConfig = {
  label: "Overview",
  matches: /^\/overview\/details/
};

module.exports = OverviewDetailTab;

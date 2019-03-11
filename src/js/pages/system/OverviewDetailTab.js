import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import mixin from "reactjs-mixin";
import { Link } from "react-router";
import { MountService } from "foundation-ui";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { StoreMixin } from "mesosphere-shared-reactjs";
import moment from "moment";
import { request } from "@dcos/mesos-client";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import MarathonStore from "#PLUGINS/services/src/js/stores/MarathonStore";

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
import MetadataStore from "../../stores/MetadataStore";
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
        <Link to="/cluster/overview">
          <Trans render="span">Overview</Trans>
        </Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return (
    <Page.Header.Breadcrumbs
      iconID={ProductIcons.Cluster}
      breadcrumbs={crumbs}
    />
  );
};

class OverviewDetailTab extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      isClusterBuildInfoOpen: false,
      masterInfo: undefined,
      cluster: undefined,
      version: undefined,
      buildTime: undefined,
      startTime: undefined
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
      }
    ];

    request({ type: "GET_FLAGS" }, "/mesos/api/v1?GET_FLAGS").subscribe(
      response => {
        const cluster = JSON.parse(response).get_flags.flags.find(
          flag => flag.name === "cluster"
        );

        if (cluster) {
          this.setState({ cluster: cluster.value });
        }
      }
    );

    request({ type: "GET_VERSION" }, "/mesos/api/v1?GET_VERSION").subscribe(
      response => {
        const info = JSON.parse(response).get_version.version_info;

        if (info) {
          this.setState({
            version: info.version,
            buildTime: info.build_time
          });
        }
      }
    );

    request({ type: "GET_MASTER" }, "/mesos/api/v1?GET_MASTER").subscribe(
      response => {
        const {
          get_master: {
            master_info: masterInfo,
            elected_time: electedTime,
            start_time: startTime
          }
        } = JSON.parse(response);

        this.setState({ masterInfo, electedTime, startTime });
      }
    );

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    super.componentDidMount(...arguments);

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
          <Trans render={<ConfigurationMapLabel />}>
            {Config.productName} Version
          </Trans>
          <ConfigurationMapValue>{productVersion}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="ccid">
          <Trans render={<ConfigurationMapLabel />}>
            Cryptographic Cluster ID
          </Trans>
          <ConfigurationMapValue>{ccid}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="publicIP">
          <Trans render={<ConfigurationMapLabel />}>Public IP</Trans>
          <ConfigurationMapValue>{publicIP}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <MountService.Mount
          type="OverviewDetailTab:AdditionalGeneralDetails:Nodes"
          limit={1}
        />
        <MountService.Mount
          type="OverviewDetailTab:AdditionalGeneralDetails:Date"
          limit={1}
        />
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
        label: i18nMark("View Cluster Configuration"),
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
      return <Trans render="span">by {mesosBuildUser}</Trans>;
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
    const {
      masterInfo,
      cluster,
      version,
      buildTime,
      startTime,
      electedTime,
      buildUser
    } = this.state;

    const mesosMasterInfo = masterInfo || this.getLoading();
    const mesosCluster = cluster || this.getLoading();
    const mesosVersion = version || this.getLoading();
    const mesosBuilt = buildTime
      ? moment(buildTime * 1000).fromNow()
      : this.getLoading();
    const mesosStarted = startTime
      ? moment(startTime * 1000).fromNow()
      : this.getLoading();
    const mesosElected = electedTime
      ? moment(electedTime * 1000).fromNow()
      : this.getLoading();
    const mesosBuildUser = buildUser;

    return (
      <ConfigurationMapSection>
        <ConfigurationMapRow key="cluster">
          <Trans render={<ConfigurationMapLabel />}>Cluster</Trans>
          <ConfigurationMapValue>{mesosCluster}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="leader">
          <Trans render={<ConfigurationMapLabel />}>Leader</Trans>
          <ConfigurationMapValue>
            {mesosMasterInfo.hostname}:{mesosMasterInfo.port}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="version">
          <Trans render={<ConfigurationMapLabel />}>Version</Trans>
          <ConfigurationMapValue>{mesosVersion}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="built">
          <Trans render={<ConfigurationMapLabel />}>Built</Trans>
          <ConfigurationMapValue>
            {mesosBuilt} {this.getMesosBuildUser(mesosBuildUser)}
          </ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="started">
          <Trans render={<ConfigurationMapLabel />}>Started</Trans>
          <ConfigurationMapValue>{mesosStarted}</ConfigurationMapValue>
        </ConfigurationMapRow>
        <ConfigurationMapRow key="elected">
          <Trans render={<ConfigurationMapLabel />}>Elected</Trans>
          <ConfigurationMapValue>{mesosElected}</ConfigurationMapValue>
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
            <Trans render={<ConfigurationMapHeading className="flush-top" />}>
              Cluster Details
            </Trans>
            <Trans render={<ConfigurationMapHeading level={2} />}>
              General
            </Trans>
            {this.getClusterDetails()}
            <Trans render={<ConfigurationMapHeading level={2} />}>
              Mesos Details
            </Trans>
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
  label: i18nMark("Overview"),
  matches: /^\/overview\/details/
};

module.exports = OverviewDetailTab;

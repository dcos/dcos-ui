import { Trans } from "@lingui/macro";
import * as React from "react";
import ClusterLinkingStore from "../stores/ClusterLinkingStore";
import { CLUSTER_LIST_SUCCESS } from "../constants/EventTypes";

export default class ClusterLinkingModalTrigger extends React.Component {
  constructor() {
    super();
    this.state = { clusterList: ClusterLinkingStore.getLinkedClusters() };
  }

  componentDidMount() {
    ClusterLinkingStore.addListener(
      CLUSTER_LIST_SUCCESS,
      this.onClusterLinksUpdated
    );
    ClusterLinkingStore.fetchClusterLinkingList();
  }

  componentWillUnmount() {
    ClusterLinkingStore.removeListener(
      CLUSTER_LIST_SUCCESS,
      this.onClusterLinksUpdated
    );
  }
  onClusterLinksUpdated = () => {
    this.setState({ clusterList: ClusterLinkingStore.getLinkedClusters() });
  };

  render() {
    const { clusterList } = this.state;

    if (clusterList.length === 0) {
      return null;
    }

    return <Trans render="span">Switch Cluster</Trans>;
  }
}

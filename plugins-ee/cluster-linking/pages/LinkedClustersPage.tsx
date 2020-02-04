import { Trans } from "@lingui/macro";
import { i18nMark } from "@lingui/react";
import { Link } from "react-router";
import * as React from "react";
import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import Page from "#SRC/js/components/Page";
import Loader from "#SRC/js/components/Loader";
import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
import MetadataStore from "#SRC/js/stores/MetadataStore";

import LinkedClustersTable from "../components/LinkedClustersTable";
import ClusterLinkingStore from "../stores/ClusterLinkingStore";

import { CLUSTER_LIST_SUCCESS } from "../constants/EventTypes";

const LinkedClustersBreadcrumbs = () => {
  const crumbs = [
    <Breadcrumb key={0} title="Linked Clusters">
      <BreadcrumbTextContent>
        <Link to="/cluster/linked">
          <Trans render="span">Linked Clusters</Trans>
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

const LinkedClusterDocumentationHint = () => {
  const docsURI = MetadataStore.buildDocsURI(
    "/administering-clusters/multiple-clusters/cluster-links"
  );

  const documentation = (
    <Trans render={<a href={docsURI} target="_blank" />}>documentation</Trans>
  );

  return (
    <Trans render="p">
      You can link a cluster via the DC/OS CLI. See {documentation} for complete
      instructions.
    </Trans>
  );
};

const EmptyLinkedClustersAlert = () => (
  <AlertPanel>
    <AlertPanelHeader>
      <Trans render="span">No linked clusters</Trans>
    </AlertPanelHeader>
    <Trans render="p">Link a cluster to switch between clusters.</Trans>
    <LinkedClusterDocumentationHint />
  </AlertPanel>
);

export default class LinkedClustersPage extends React.Component {
  static routeConfig = {
    label: i18nMark("Linked Clusters"),
    matches: /^\/cluster\/linked/
  };
  constructor() {
    super();
    this.state = {
      clusters: [],
      loading: true
    };
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
    this.setState({
      clusters: ClusterLinkingStore.getLinkedClusters(),
      loading: false
    });
  };

  getPageContent() {
    const { clusters, loading } = this.state;

    if (loading) {
      return <Loader />;
    }

    if (clusters.length === 0) {
      return <EmptyLinkedClustersAlert />;
    }

    return (
      <div>
        <LinkedClusterDocumentationHint />
        <LinkedClustersTable clusters={clusters} />
      </div>
    );
  }

  render() {
    return (
      <Page>
        <Page.Header breadcrumbs={<LinkedClustersBreadcrumbs />} />
        {this.getPageContent()}
      </Page>
    );
  }
}

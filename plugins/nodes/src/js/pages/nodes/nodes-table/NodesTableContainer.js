import mixin from "reactjs-mixin";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { map } from "rxjs/operators";
import { combineLatest } from "rxjs";
import { graphqlObservable, componentFromStream } from "@dcos/data-service";
import gql from "graphql-tag";

import CompositeState from "#SRC/js/structs/CompositeState";
import QueryParamsMixin from "#SRC/js/mixins/QueryParamsMixin";
import NodesList from "#SRC/js/structs/NodesList";
import Node from "#SRC/js/structs/Node";
import { default as schema } from "#PLUGINS/nodes/src/js/data/NodesNetworkResolver";
import NodesTable from "#PLUGINS/nodes/src/js/components/NodesTable";

class NodesTableContainer extends mixin(StoreMixin, QueryParamsMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      filteredNodes: new NodesList([]),
      filters: { health: "all", name: "", service: null },
      nodeHealthResponse: false,
      masterRegion: null
    };
    this.store_listeners = [
      {
        events: ["success"],
        listenAlways: false,
        name: "nodeHealth",
        suppressUpdate: true
      },
      { name: "state", events: ["success"], suppressUpdate: false }
    ];
  }

  componentWillMount() {
    this.onStateStoreSuccess();
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: { query },
      hosts,
      networks
    } = nextProps;
    const filters = {
      health: query.filterHealth || "all",
      name: query.searchString || "",
      service: query.filterService || null
    };
    this.setFilters(hosts, networks, filters);
  }

  getFilteredNodes(filters = this.state.filters) {
    const { networks = [] } = this.props;

    return new NodesList({
      items: CompositeState.getNodesList()
        .getItems()
        .map(node => {
          const hostname = node.getHostName();
          const network = networks.find(
            network => network.private_ip === hostname
          );

          if (network == null) {
            return node;
          }

          return new Node({ ...node.toJSON(), network });
        })
    }).filter(filters);
  }

  // TODO: remove set Filters and only filter at the top level;
  setFilters(nodes, networks = [], newFilters, callback) {
    if (newFilters.service === "") {
      newFilters.service = null;
    }

    const newNodes = new NodesList({
      items: nodes.getItems().map(node => {
        const hostname = node.getHostName();
        const network = networks.find(
          network => network.private_ip === hostname
        );

        if (network == null) {
          return node;
        }

        return new Node({ ...node.toJSON(), network });
      })
    });
    const filters = Object.assign({}, this.state.filters, newFilters);
    const filteredNodes = newNodes.filter(filters);

    this.setState({ filters, filteredNodes }, callback);
  }

  onNodeHealthStoreSuccess() {
    this.setState({
      filteredNodes: this.getFilteredNodes(),
      nodeHealthResponse: true
    });
  }

  onStateStoreSuccess() {
    this.setState({
      masterRegion: CompositeState.getMasterNode().getRegionName()
    });
  }

  render() {
    const { nodeHealthResponse, filteredNodes, masterRegion } = this.state;

    return (
      <NodesTable
        hosts={filteredNodes}
        nodeHealthResponse={nodeHealthResponse}
        masterRegion={masterRegion}
      />
    );
  }
}

const networks$ = graphqlObservable(
  gql`
    query {
      networks(privateIP: $privateIP) {
        public_ips
        private_ip
      }
    }
  `,
  schema,
  {}
).pipe(map(response => response.data.networks));

module.exports = componentFromStream(props$ =>
  combineLatest(props$, networks$).pipe(
    map(([props, networks]) => (
      <NodesTableContainer {...props} networks={networks} />
    ))
  )
);

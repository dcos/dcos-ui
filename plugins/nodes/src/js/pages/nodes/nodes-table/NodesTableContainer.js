import mixin from "reactjs-mixin";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { map, switchMap, share, startWith } from "rxjs/operators";
import { combineLatest, timer } from "rxjs";
import { componentFromStream } from "@dcos/data-service";

import CompositeState from "#SRC/js/structs/CompositeState";
import QueryParamsMixin from "#SRC/js/mixins/QueryParamsMixin";
import NodesList from "#SRC/js/structs/NodesList";
import Node from "#SRC/js/structs/Node";
import Config from "#SRC/js/config/Config";

import NodesTable from "../../../components/NodesTable";
import { fetchNodesNetwork } from "../../../data/NodesNetworkClient";

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

    nodes = new NodesList({
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
    const filteredNodes = nodes.filter(filters);

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

const pollingInterval$ = timer(0, Config.getRefreshRate());
const nodes$ = pollingInterval$.pipe(
  switchMap(() => fetchNodesNetwork()),
  map(response => response.response),
  startWith([]),
  share()
);

module.exports = componentFromStream(props$ =>
  combineLatest(props$, nodes$).pipe(
    map(([props, networks]) => (
      <NodesTableContainer {...props} networks={networks} />
    ))
  )
);

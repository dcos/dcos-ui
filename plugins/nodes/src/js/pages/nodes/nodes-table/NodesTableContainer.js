import mixin from "reactjs-mixin";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

import CompositeState from "#SRC/js/structs/CompositeState";
import QueryParamsMixin from "#SRC/js/mixins/QueryParamsMixin";
import NodesList from "#SRC/js/structs/NodesList";

import NodesTable from "../../../components/NodesTable-new";

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
      hosts
    } = nextProps;
    const filters = {
      health: query.filterHealth || "all",
      name: query.searchString || "",
      service: query.filterService || null
    };
    this.setFilters(hosts, filters);
  }

  getFilteredNodes(filters = this.state.filters) {
    return CompositeState.getNodesList().filter(filters);
  }

  // TODO: remove set Filters and only filter at the top level;
  setFilters(nodes, newFilters, callback) {
    if (newFilters.service === "") {
      newFilters.service = null;
    }
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

module.exports = NodesTableContainer;

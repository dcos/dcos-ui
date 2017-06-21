import mixin from "reactjs-mixin";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

import CompositeState from "../../../../../../../src/js/structs/CompositeState";
import NodesTable from "../../../components/NodesTable";
import QueryParamsMixin
  from "../../../../../../../src/js/mixins/QueryParamsMixin";

class NodesTableContainer extends mixin(StoreMixin, QueryParamsMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      filteredNodes: [],
      filters: { health: "all", name: "", service: null },
      receivedNodeHealthResponse: false
    };
    this.store_listeners = [
      {
        events: ["success"],
        listenAlways: false,
        name: "nodeHealth",
        suppressUpdate: true
      }
    ];
  }

  componentWillReceiveProps(nextProps) {
    const { location: { query } } = nextProps;
    const filters = {
      health: query.filterHealth || "all",
      name: query.searchString || "",
      service: query.filterService || null
    };
    this.setFilters(filters);
  }

  getFilteredNodes(filters = this.state.filters) {
    return CompositeState.getNodesList().filter(filters).getItems();
  }

  setFilters(newFilters, callback) {
    if (newFilters.service === "") {
      newFilters.service = null;
    }
    const filters = Object.assign({}, this.state.filters, newFilters);
    const filteredNodes = this.getFilteredNodes(filters);

    this.setState({ filters, filteredNodes }, callback);
  }

  onNodeHealthStoreSuccess() {
    this.setState({
      filteredNodes: this.getFilteredNodes(),
      receivedNodeHealthResponse: true
    });
  }

  render() {
    const { receivedNodeHealthResponse, filteredNodes } = this.state;

    return (
      <NodesTable
        hosts={filteredNodes}
        receivedNodeHealthResponse={receivedNodeHealthResponse}
      />
    );
  }
}

module.exports = NodesTableContainer;

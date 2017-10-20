import mixin from "reactjs-mixin";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

import CompositeState from "#SRC/js/structs/CompositeState";
import QueryParamsMixin from "#SRC/js/mixins/QueryParamsMixin";
import NodesList from "#SRC/js/structs/NodesList";

import NodesTable from "../../../components/NodesTable";

class NodesTableContainer extends mixin(StoreMixin, QueryParamsMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      filteredNodes: new NodesList([]),
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

  getFilteredNodes(filters = this.state.filters) {
    return CompositeState.getNodesList().filter(filters);
  }

  onNodeHealthStoreSuccess() {
    this.setState({
      filteredNodes: this.getFilteredNodes(),
      receivedNodeHealthResponse: true
    });
  }

  render() {
    const { receivedNodeHealthResponse } = this.state;

    const { hosts } = this.props;

    return (
      <NodesTable
        hosts={hosts}
        receivedNodeHealthResponse={receivedNodeHealthResponse}
      />
    );
  }
}

module.exports = NodesTableContainer;

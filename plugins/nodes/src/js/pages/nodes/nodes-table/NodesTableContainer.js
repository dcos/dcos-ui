import mixin from "reactjs-mixin";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";
import { map, catchError } from "rxjs/operators";
import { combineLatest, of } from "rxjs";
import { graphqlObservable, componentFromStream } from "@dcos/data-service";
import gql from "graphql-tag";

import MesosSummaryActions from "#SRC/js/events/MesosSummaryActions";
import CompositeState from "#SRC/js/structs/CompositeState";
import NodesList from "#SRC/js/structs/NodesList";
import Node from "#SRC/js/structs/Node";
import { defaultNetworkErrorHandler } from "#SRC/js/utils/DefaultErrorUtil";
import { default as schema } from "#PLUGINS/nodes/src/js/data/NodesNetworkResolver";
import NodesTable from "#PLUGINS/nodes/src/js/components/NodesTable";
import DrainNodeModal from "#PLUGINS/nodes/src/js/components/modals/DrainNodeModal";
import DeactivateNodeConfirm from "#PLUGINS/nodes/src/js/components/modals/DeactivateNodeConfirm";
import NodeMaintenanceActions from "#PLUGINS/nodes/src/js/actions/NodeMaintenanceActions";

class NodesTableContainer extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      filteredNodes: null,
      filters: { health: "all", name: "", service: null },
      masterRegion: null,
      selectedNodeToDrain: null,
      selectedNodeToDeactivate: null,
      reactivateNetworkError: false
    };

    this.store_listeners = [
      {
        events: ["success"],
        listenAlways: false,
        name: "nodeHealth",
        suppressUpdate: true
      },
      { name: "state", events: ["success"], suppressUpdate: true }
    ];

    this.handleNodeAction = this.handleNodeAction.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  componentWillMount() {
    this.onStateStoreSuccess();
    const { location, hosts, networks } = this.props;

    const filters = {
      health: location.query.filterHealth || "all",
      name: location.query.searchString || "",
      service: location.query.filterService || null
    };

    this.setFilters(hosts, networks, filters);
  }

  componentWillReceiveProps(nextProps) {
    const { location, hosts, networks } = nextProps;
    const filters = {
      health: location.query.filterHealth || "all",
      name: location.query.searchString || "",
      service: location.query.filterService || null
    };

    // when trying to optimize here, please account for data that may change in `hosts`,
    // like `TASK_RUNNING`, `resources.*` or `drain_info`.
    this.setFilters(hosts, networks, filters);
  }

  getFilteredNodes(filters = this.state.filters) {
    const { networks = [] } = this.props;

    return new NodesList({
      items: this.props.hosts.getItems().map(node => {
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
    this.setState({ filteredNodes: this.getFilteredNodes() });
  }

  onStateStoreSuccess() {
    this.setState({
      masterRegion: CompositeState.getMasterNode().getRegionName()
    });
  }

  handleNodeAction(node, action) {
    // TODO: Status#StatusAction enum
    if (action === "drain") {
      this.setState({ selectedNodeToDrain: node });
    } else if (action === "deactivate") {
      this.setState({ selectedNodeToDeactivate: node });
    } else if (action === "reactivate") {
      NodeMaintenanceActions.reactivateNode(node, {
        onSuccess: () => {
          MesosSummaryActions.fetchSummary();
        },
        onError: defaultNetworkErrorHandler
      });
    }
  }

  handleCloseModal() {
    this.setState({
      selectedNodeToDrain: null,
      selectedNodeToDeactivate: null
    });
    MesosSummaryActions.fetchSummary();
  }

  render() {
    const {
      filteredNodes,
      masterRegion,
      selectedNodeToDrain,
      selectedNodeToDeactivate
    } = this.state;
    const { networks = [] } = this.props;

    return (
      <React.Fragment>
        <NodesTable
          withPublicIP={networks.length > 0}
          hosts={filteredNodes}
          masterRegion={masterRegion}
          onNodeAction={this.handleNodeAction}
        />
        <DrainNodeModal
          open={selectedNodeToDrain !== null}
          node={selectedNodeToDrain}
          onClose={this.handleCloseModal}
        />
        <DeactivateNodeConfirm
          open={selectedNodeToDeactivate !== null}
          node={selectedNodeToDeactivate}
          onClose={this.handleCloseModal}
        />
      </React.Fragment>
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
).pipe(
  map(response => response.data.networks),
  catchError(() => of([]))
);

module.exports = componentFromStream(props$ =>
  combineLatest(props$, networks$).pipe(
    map(([props, networks]) => (
      <NodesTableContainer {...props} networks={networks} />
    ))
  )
);

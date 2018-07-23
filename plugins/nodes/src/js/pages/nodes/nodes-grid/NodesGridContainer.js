import isEqual from "lodash.isequal";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import React from "react";
import { routerShape } from "react-router";
import { StoreMixin } from "mesosphere-shared-reactjs";

import CompositeState from "#SRC/js/structs/CompositeState";
import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import QueryParamsMixin from "#SRC/js/mixins/QueryParamsMixin";
import NodesList from "#SRC/js/structs/NodesList";

import NodesGridView from "../../../components/NodesGridView";

const MAX_SERVICES_TO_SHOW = 32;
const METHODS_TO_BIND = [];
const OTHER_SERVICES_COLOR = 32;

class NodesGridContainer extends mixin(StoreMixin, QueryParamsMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      filteredNodes: new NodesList([]),
      filters: { health: "all", name: "", service: null },
      hasLoadingError: false,
      hiddenServices: [],
      mesosStateErrorCount: 0,
      receivedEmptyMesosState: true,
      receivedNodeHealthResponse: false,
      resourcesByFramework: {},
      serviceColors: {}
    };
    this.store_listeners = [
      {
        events: ["success"],
        listenAlways: false,
        name: "nodeHealth",
        suppressUpdate: true
      },
      {
        events: ["success", "error"],
        name: "state",
        suppressUpdate: true
      }
    ];
    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillReceiveProps(props) {
    const {
      services,
      location: { query },
      hosts
    } = props;
    const ids = services.map(function(service) {
      return service.id;
    });

    const { serviceColors } = this.state;

    if (!isEqual(Object.keys(serviceColors), ids)) {
      this.computeServiceColors(services);
      this.computeShownServices(services);
    }

    const filters = {
      health: query.filterHealth || "all",
      name: query.searchString || "",
      service: query.filterService || null
    };
    this.setFilters(hosts, filters);
  }

  computeServiceColors(services) {
    var colors = {};

    services.forEach(function(service, index) {
      // Drop all others into the same 'other' color
      if (index < MAX_SERVICES_TO_SHOW) {
        colors[service.id] = index;
      } else {
        colors.other = OTHER_SERVICES_COLOR;
      }
    });

    this.setState({ serviceColors: colors });
  }

  computeShownServices(services) {
    var hidden = services.slice(MAX_SERVICES_TO_SHOW).map(function(service) {
      return service.id;
    });

    this.setState({ hiddenServices: hidden });
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

  onStateStoreSuccess() {
    const { hiddenServices } = this.state;
    const resourcesByFramework = MesosStateStore.getHostResourcesByFramework(
      hiddenServices
    );
    const receivedEmptyMesosState =
      Object.keys(MesosStateStore.get("lastMesosState")).length === 0;
    this.setState({ resourcesByFramework, receivedEmptyMesosState });
  }

  onStateStoreError() {
    const mesosStateErrorCount = this.state.mesosStateErrorCount + 1;
    if (mesosStateErrorCount > 3) {
      this.setState({ mesosStateErrorCount, hasLoadingError: true });
    } else {
      this.setState({ mesosStateErrorCount });
    }
  }

  onNodeHealthStoreSuccess() {
    this.setState({
      filteredNodes: this.getFilteredNodes(),
      receivedNodeHealthResponse: true
    });
  }

  render() {
    const {
      filteredNodes,
      hasLoadingError,
      hiddenServices,
      receivedEmptyMesosState,
      receivedNodeHealthResponse,
      resourcesByFramework,
      serviceColors
    } = this.state;

    const { services, selectedResource } = this.props;

    return (
      <NodesGridView
        hasLoadingError={hasLoadingError}
        hiddenServices={hiddenServices}
        hosts={filteredNodes}
        receivedEmptyMesosState={receivedEmptyMesosState}
        receivedNodeHealthResponse={receivedNodeHealthResponse}
        resourcesByFramework={resourcesByFramework}
        selectedResource={selectedResource}
        serviceColors={serviceColors}
        services={services}
      />
    );
  }
}

NodesGridContainer.contextTypes = {
  router: routerShape.isRequired,
  selectedResource: PropTypes.string
};

module.exports = NodesGridContainer;

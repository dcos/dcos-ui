import isEqual from "lodash.isequal";
import mixin from "reactjs-mixin";
import PropTypes from "prop-types";
import * as React from "react";
import { routerShape } from "react-router";

import MesosStateStore from "#SRC/js/stores/MesosStateStore";
import NodesList from "#SRC/js/structs/NodesList";
import StoreMixin from "#SRC/js/mixins/StoreMixin";

import NodesGridView from "../../../components/NodesGridView";

const MAX_SERVICES_TO_SHOW = 32;

const OTHER_SERVICES_COLOR = 32;

class NodesGridContainer extends mixin(StoreMixin) {
  constructor(...args) {
    super(...args);

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
    // prettier-ignore
    this.store_listeners = [
      {events: ["success"], name: "nodeHealth", suppressUpdate: true},
      {events: ["success", "error"], name: "state", suppressUpdate: true}
    ];
  }

  UNSAFE_componentWillReceiveProps(props) {
    const {
      services,
      location: { query },
      hosts
    } = props;
    const ids = services.map(service => service.id);

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
    const colors = {};

    services.forEach((service, index) => {
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
    const hidden = services
      .slice(MAX_SERVICES_TO_SHOW)
      .map(service => service.id);

    this.setState({ hiddenServices: hidden });
  }

  getFilteredNodes(filters = this.state.filters) {
    return this.props.hosts.filter(filters);
  }

  // TODO: remove set Filters and only filter at the top level;
  setFilters(nodes, newFilters, callback) {
    if (newFilters.service === "") {
      newFilters.service = null;
    }
    const filters = {
      ...this.state.filters,
      ...newFilters
    };
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

export default NodesGridContainer;

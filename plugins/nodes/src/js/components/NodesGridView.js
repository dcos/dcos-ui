import classNames from "classnames";
import PureRender from "react-addons-pure-render-mixin";
import PropTypes from "prop-types";
import React from "react";

import Loader from "#SRC/js/components/Loader";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";
import NodesList from "#SRC/js/structs/NodesList";

import NodesGridDials from "./NodesGridDials";

var MAX_SERVICES_TO_SHOW = 32;
var OTHER_SERVICES_COLOR = 32;

var NodesGridView = React.createClass({
  displayName: "NodesGridView",

  mixins: [PureRender],

  propTypes: {
    hasLoadingError: PropTypes.bool,
    hiddenServices: PropTypes.array,
    hosts: PropTypes.instanceOf(NodesList).isRequired,
    receivedEmptyMesosState: PropTypes.bool,
    receivedNodeHealthResponse: PropTypes.bool,
    resourcesByFramework: PropTypes.object.isRequired,
    selectedResource: PropTypes.string.isRequired,
    serviceColors: PropTypes.object.isRequired,
    services: PropTypes.array.isRequired
  },

  defaultProps: {
    hasLoadingError: false,
    hiddenServices: [],
    receivedNodeHealthResponse: false
  },

  getLoadingScreen() {
    var { hasLoadingError } = this.props;
    var errorMsg = null;
    if (hasLoadingError) {
      errorMsg = <RequestErrorMsg />;
    }

    var loadingClassSet = classNames({
      hidden: hasLoadingError
    });

    return (
      <div className="pod flush-left flush-right">
        <Loader className={loadingClassSet} />
        {errorMsg}
      </div>
    );
  },

  getActiveServiceIds() {
    return this.props.services.map(function(service) {
      return service.getId();
    });
  },

  getServicesList(props) {
    // Return a list of unique service IDs from the selected hosts.
    var activeServiceIds = this.getActiveServiceIds();

    // Filter out inactive services
    var items = props.services
      .filter(function(service) {
        return activeServiceIds.includes(service.id);
      })
      // Limit to max amount
      .slice(0, MAX_SERVICES_TO_SHOW)
      // Return view definition
      .map(function(service) {
        var color = props.serviceColors[service.id];
        var className = `dot service-color-${color}`;

        return (
          <li key={service.id}>
            <span className={className} />
            <span>{service.name}</span>
          </li>
        );
      });

    // Add 'Others' node to the list
    if (activeServiceIds.length > MAX_SERVICES_TO_SHOW) {
      var classNameOther =
        "service-legend-color service-color-" + OTHER_SERVICES_COLOR;
      items.push(
        <li key="other">
          <span className={classNameOther} />
          <span>Other</span>
        </li>
      );
    }

    return (
      <ul className="list list-unstyled nodes-grid-service-list">{items}</ul>
    );
  },

  getNodesGrid() {
    var { props } = this;

    var classSet = classNames({
      "side-list nodes-grid-legend": true
    });

    return (
      <div className="nodes-grid">
        <div className={classSet}>{this.getServicesList(props)}</div>

        <NodesGridDials
          hosts={props.hosts.getItems()}
          resourcesByFramework={props.resourcesByFramework}
          selectedResource={props.selectedResource}
          serviceColors={props.serviceColors}
        />
      </div>
    );
  },

  render() {
    const {
      hasLoadingError,
      receivedEmptyMesosState,
      receivedNodeHealthResponse
    } = this.props;

    if (
      hasLoadingError ||
      receivedEmptyMesosState ||
      !receivedNodeHealthResponse
    ) {
      return this.getLoadingScreen();
    } else {
      return this.getNodesGrid();
    }
  }
});

module.exports = NodesGridView;

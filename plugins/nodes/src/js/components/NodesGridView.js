import classNames from "classnames";
import { Form } from "reactjs-components";
import PureRender from "react-addons-pure-render-mixin";
import React from "react";

import Loader from "../../../../../src/js/components/Loader";
import NodesGridDials from "./NodesGridDials";
import RequestErrorMsg from "../../../../../src/js/components/RequestErrorMsg";

var MAX_SERVICES_TO_SHOW = 32;
var OTHER_SERVICES_COLOR = 32;

var NodesGridView = React.createClass({
  displayName: "NodesGridView",

  mixins: [PureRender],

  propTypes: {
    hasLoadingError: React.PropTypes.bool,
    hiddenServices: React.PropTypes.array,
    hosts: React.PropTypes.array.isRequired,
    receivedEmptyMesosState: React.PropTypes.bool,
    receivedNodeHealthResponse: React.PropTypes.bool,
    onShowServices: React.PropTypes.func.isRequired,
    resourcesByFramework: React.PropTypes.object.isRequired,
    selectedResource: React.PropTypes.string.isRequired,
    serviceColors: React.PropTypes.object.isRequired,
    services: React.PropTypes.array.isRequired,
    showServices: React.PropTypes.bool
  },

  defaultProps: {
    hasLoadingError: false,
    hiddenServices: [],
    receivedNodeHealthResponse: false,
    showServices: false
  },

  handleCheckboxChange(model) {
    this.props.onShowServices(model.showServices);
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
      <ul className="list list-unstyled nodes-grid-service-list">
        {items}
      </ul>
    );
  },

  getNodesGrid() {
    var { props } = this;

    var classSet = classNames({
      "side-list nodes-grid-legend": true,
      disabled: !props.showServices
    });

    return (
      <div className="nodes-grid">

        <div className={classSet}>
          <label className="show-services-label h5 tall flush-top">
            <Form
              definition={[
                {
                  fieldType: "checkbox",
                  name: "showServices",
                  checked: props.showServices,
                  label: "Show Services by Share",
                  value: props.showServices
                }
              ]}
              onChange={this.handleCheckboxChange}
            />
          </label>
          {this.getServicesList(props)}
        </div>

        <NodesGridDials
          hosts={props.hosts}
          resourcesByFramework={props.resourcesByFramework}
          selectedResource={props.selectedResource}
          serviceColors={props.serviceColors}
          showServices={props.showServices}
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

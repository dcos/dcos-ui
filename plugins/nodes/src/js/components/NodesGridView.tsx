import * as React from "react";
import { Trans } from "@lingui/macro";
import classNames from "classnames";

import Loader from "#SRC/js/components/Loader";
import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";

import NodesGridDials from "./NodesGridDials";

const MAX_SERVICES_TO_SHOW = 32;
const OTHER_SERVICES_COLOR = 32;

interface NodesGridViewProps {
  hasLoadingError?: boolean;
  hiddenServices?: string[];
  hosts: Node[];
  receivedEmptyMesosState?: boolean;
  receivedNodeHealthResponse?: boolean;
  resourcesByFramework: ResourcesByFramework;
  selectedResource: string;
  serviceColors: ServiceColors;
  services: any[]; // TODO TS: Framework[] `plugins/services/src/js/structs/Framework.js`
}

export default class NodesGridView extends React.PureComponent<
  NodesGridViewProps,
  {}
> {
  public static defaultProps: Partial<NodesGridViewProps> = {
    hasLoadingError: false,
    hiddenServices: [],
    receivedEmptyMesosState: false,
    receivedNodeHealthResponse: false
  };

  getLoadingScreen() {
    const { hasLoadingError } = this.props;
    const errorMsg = hasLoadingError ? <RequestErrorMsg /> : null;

    const loadingClassSet = classNames({
      hidden: hasLoadingError
    });

    return (
      <div className="pod flush-left flush-right">
        <Loader className={loadingClassSet} />
        {errorMsg}
      </div>
    );
  }

  getActiveServiceIds() {
    return this.props.services.map(service => service.getId());
  }

  getServicesList() {
    const { services, serviceColors } = this.props;

    // Return a list of unique service IDs from the selected hosts.
    const activeServiceIds = this.getActiveServiceIds();

    // Filter out inactive services
    const items = services
      .filter(service => activeServiceIds.includes(service.id))
      // Limit to max amount
      .slice(0, MAX_SERVICES_TO_SHOW)
      // Return view definition
      .map(service => {
        const color = serviceColors[service.id];
        const className = `dot service-color-${color}`;

        return (
          <li key={service.id}>
            <span className={className} />
            <span>{service.name}</span>
          </li>
        );
      });

    // Add 'Others' node to the list
    if (activeServiceIds.length > MAX_SERVICES_TO_SHOW) {
      const classNameOther = `dot service-color-${OTHER_SERVICES_COLOR}`;
      items.push(
        <li key="other">
          <span className={classNameOther} />
          <Trans render="span">Other</Trans>
        </li>
      );
    }

    return (
      <ul className="list list-unstyled nodes-grid-service-list">{items}</ul>
    );
  }

  getNodesGrid() {
    const {
      hosts,
      resourcesByFramework,
      selectedResource,
      serviceColors
    } = this.props;

    const classSet = classNames({
      "side-list nodes-grid-legend": true
    });

    return (
      <div className="nodes-grid">
        <div className={classSet}>{this.getServicesList()}</div>

        <NodesGridDials
          hosts={(hosts as any).getItems()}
          resourcesByFramework={resourcesByFramework}
          selectedResource={selectedResource}
          serviceColors={serviceColors}
        />
      </div>
    );
  }

  shouldRenderLoadingScreen() {
    const {
      hasLoadingError,
      receivedEmptyMesosState,
      receivedNodeHealthResponse
    } = this.props;

    return (
      hasLoadingError || receivedEmptyMesosState || !receivedNodeHealthResponse
    );
  }

  render() {
    if (this.shouldRenderLoadingScreen()) {
      return this.getLoadingScreen();
    } else {
      return this.getNodesGrid();
    }
  }
}

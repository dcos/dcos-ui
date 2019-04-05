import * as React from "react";
import { MESOS_SUMMARY_CHANGE } from "#SRC/js/constants/EventTypes";
import MesosSummaryStore from "./MesosSummaryStore";
import Node from "../structs/Node";

const getNodeFromSummary = (nodeId?: string, summary?: any) => {
  const trimmedNodeID = nodeId
    ? decodeURIComponent(nodeId).replace(/^\//, "")
    : "";
  if (summary == null || nodeId == null || trimmedNodeID.length < 1) {
    return null;
  }
  const nodes = summary.slaves;
  let match = null;
  if (nodes) {
    match = nodes.find((node: any) => node.id === nodeId);
  }

  return match ? new Node(match) : null;
};

interface WithNodeState {
  summary?: any;
}

export function withNode<P extends object>(
  ComponentWithNode: React.ComponentType<P>
) {
  return class extends React.Component<any, WithNodeState> {
    constructor(props: any) {
      super(props);
      this.receiveNewSummary = this.receiveNewSummary.bind(this);
      this.state = {
        summary: MesosSummaryStore.getLastSuccessfulSummarySnapshot()
      };
    }

    receiveNewSummary() {
      this.setState({
        summary: MesosSummaryStore.getLastSuccessfulSummarySnapshot()
      });
    }

    componentWillMount() {
      MesosSummaryStore.addChangeListener(
        MESOS_SUMMARY_CHANGE,
        this.receiveNewSummary
      );
    }

    componentWillUnmount() {
      MesosSummaryStore.removeChangeListener(
        MESOS_SUMMARY_CHANGE,
        this.receiveNewSummary
      );
    }

    render() {
      const { summary } = this.state;
      const nodeID = this.props.params.nodeID;
      const node = getNodeFromSummary(nodeID, summary);

      return <ComponentWithNode node={node} {...this.props as P} />;
    }
  };
}

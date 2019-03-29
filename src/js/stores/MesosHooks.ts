import * as React from "react";
import { MESOS_SUMMARY_CHANGE } from "#SRC/js/constants/EventTypes";
import MesosSummaryStore from "./MesosSummaryStore";

const getNodeFromSummary = (nodeId?: string, summary?: any) => {
  const trimmedNodeID = nodeId
    ? decodeURIComponent(nodeId).replace(/^\//, "")
    : "";
  if (summary == null || nodeId == null || trimmedNodeID.length < 1) {
    return null;
  }
  const nodes = summary.slaves;

  return nodes && (nodes.find((node: any) => node.id === nodeId) || null);
};

export function useNode(nodeId?: string) {
  const [summary, setSummary] = React.useState(
    MesosSummaryStore.getLastSuccessfulSummarySnapshot()
  );
  const receiveNewSummary = () => {
    const newSummary = MesosSummaryStore.getLastSuccessfulSummarySnapshot();
    setSummary(newSummary);
  };

  React.useEffect(() => {
    MesosSummaryStore.addChangeListener(
      MESOS_SUMMARY_CHANGE,
      receiveNewSummary
    );

    return () => {
      MesosSummaryStore.removeChangeListener(
        MESOS_SUMMARY_CHANGE,
        receiveNewSummary
      );
    };
  }, []);

  return getNodeFromSummary(nodeId, summary);
}

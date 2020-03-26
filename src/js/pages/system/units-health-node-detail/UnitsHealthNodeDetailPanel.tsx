import PropTypes from "prop-types";
import * as React from "react";

import NodeInfoPanel from "./NodeInfoPanel";

const UnitsHealthNodeDetailPanel = (props) => {
  const { summary, docsURL, output } = props;

  return (
    <div className="flex-container-col">
      <div className="flex-container-col flex-grow no-overflow">
        <NodeInfoPanel docsURL={docsURL} output={output} summary={summary} />
      </div>
    </div>
  );
};

UnitsHealthNodeDetailPanel.propTypes = {
  docsURL: PropTypes.string,
  hostIP: PropTypes.string,
  output: PropTypes.string,
  summary: PropTypes.node,
};

export default UnitsHealthNodeDetailPanel;

import PropTypes from "prop-types";
import React from "react";

import NodeInfoPanel from "./NodeInfoPanel";

class UnitsHealthNodeDetailPanel extends React.PureComponent {
  render() {
    const { summary, docsURL, output } = this.props;

    return (
      <div className="flex-container-col">
        <div className="flex-container-col flex-grow no-overflow">
          <NodeInfoPanel docsURL={docsURL} output={output} summary={summary} />
        </div>
      </div>
    );
  }
}

UnitsHealthNodeDetailPanel.propTypes = {
  docsURL: PropTypes.string,
  hostIP: PropTypes.string,
  output: PropTypes.string,
  summary: PropTypes.node
};

module.exports = UnitsHealthNodeDetailPanel;

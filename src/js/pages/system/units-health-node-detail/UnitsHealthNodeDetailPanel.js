/* @flow */
import PureRender from "react-addons-pure-render-mixin";
import React from "react";

import NodeInfoPanel from "./NodeInfoPanel";

type Props = {
  docsURL?: string,
  hostIP?: string,
  output?: string,
  summary?: string
};

class UnitsHealthNodeDetailPanel extends React.Component {
  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
  }



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

module.exports = UnitsHealthNodeDetailPanel;

import PureRender from "react-addons-pure-render-mixin";
import React from "react";

import ConfigurationMap from "../../../components/ConfigurationMap";
import ConfigurationMapHeading
  from "../../../components/ConfigurationMapHeading";
import ConfigurationMapRow from "../../../components/ConfigurationMapRow";
import ConfigurationMapSection
  from "../../../components/ConfigurationMapSection";

import { documentationURI } from "../../../config/Config";

class NodeInfoPanel extends React.Component {
  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
  }

  render() {
    const { summary, docsURL, output } = this.props;

    return (
      <div className="container">
        <ConfigurationMap>
          <ConfigurationMapSection>
            <ConfigurationMapHeading>
              Summary
            </ConfigurationMapHeading>
            <p>
              {summary}
            </p>
            <a href={docsURL} target="_blank">
              View Documentation
            </a>
          </ConfigurationMapSection>
          <ConfigurationMapSection>
            <ConfigurationMapHeading>
              Output
            </ConfigurationMapHeading>
            <ConfigurationMapRow>
              <pre className="flex-item-grow-1 flush-bottom">
                {output}
              </pre>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
        </ConfigurationMap>
      </div>
    );
  }
}

NodeInfoPanel.propTypes = {
  docsURL: React.PropTypes.string,
  output: React.PropTypes.string,
  summary: React.PropTypes.string
};

NodeInfoPanel.defaultProps = {
  docsURL: documentationURI
};

module.exports = NodeInfoPanel;

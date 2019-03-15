import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import React from "react";

import ConfigurationMap from "../../../components/ConfigurationMap";
import ConfigurationMapHeading from "../../../components/ConfigurationMapHeading";
import ConfigurationMapRow from "../../../components/ConfigurationMapRow";
import ConfigurationMapSection from "../../../components/ConfigurationMapSection";

class NodeInfoPanel extends React.PureComponent {
  render() {
    const { summary, docsURL, output } = this.props;

    return (
      <div className="container">
        <ConfigurationMap>
          <ConfigurationMapSection>
            <ConfigurationMapHeading>
              <Trans render="span">Summary</Trans>
            </ConfigurationMapHeading>
            <p>{summary}</p>
            {docsURL && (
              <a href={docsURL} target="_blank">
                <Trans render="span">View Documentation</Trans>
              </a>
            )}
          </ConfigurationMapSection>
          <ConfigurationMapSection>
            <ConfigurationMapHeading>
              <Trans render="span">Output</Trans>
            </ConfigurationMapHeading>
            <ConfigurationMapRow>
              <pre className="flex-item-grow-1 flush-bottom">{output}</pre>
            </ConfigurationMapRow>
          </ConfigurationMapSection>
        </ConfigurationMap>
      </div>
    );
  }
}

NodeInfoPanel.propTypes = {
  docsURL: PropTypes.string,
  output: PropTypes.string,
  summary: PropTypes.node
};

export default NodeInfoPanel;

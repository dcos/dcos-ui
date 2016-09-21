import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';

import {documentationURI} from '../../../config/Config';

class NodeInfoPanel extends React.Component {

  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate;
  }

  render() {
    const {summary, docsURL, output} = this.props;

    return (
      <div className="flex-container-col flex-grow">
        <span className="h4 inverse flush-top">Summary</span>
        <p className="inverse">
          {summary}
        </p>
        <p className="inverse">
          <a href={docsURL} target="_blank">
            View Documentation
          </a>
        </p>
        <span className="h4 inverse">Output</span>
        <pre className="flex-grow flush-bottom">
          {output}
        </pre>
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

import PureRender from 'react-addons-pure-render-mixin';
import React from 'react';

import Breadcrumbs from '../../../components/Breadcrumbs';
import DetailViewHeader from '../../../../../src/js/components/DetailViewHeader';
import Icon from '../../../components/Icon';
import NodeInfoPanel from './NodeInfoPanel';

class UnitsHealthNodeDetailPanel extends React.Component {

  constructor() {
    super(...arguments);
    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
  }

  renderSubTitle() {
    const {healthStatus, healthStatusClassNames, hostIP} = this.props;

    return (
      <ul className="list-inline flush-bottom">
        <li>
          <span className={healthStatusClassNames}>
            {healthStatus}
          </span>
        </li>
        <li>
          {hostIP}
        </li>
      </ul>
    );
  }

  render() {
    const {pageHeaderTitle, summary, docsURL, output} = this.props;

    return (
      <div className="flex-container-col">
        <Breadcrumbs routes={this.props.routes} params={this.props.params} />
        <DetailViewHeader
          icon={<Icon color="neutral" id="heart-pulse" size="large" />}
          subTitle={this.renderSubTitle()}
          title={pageHeaderTitle} />
        <div className="flex-container-col flex-grow no-overflow">
          <NodeInfoPanel
            docsURL={docsURL}
            output={output}
            summary={summary} />
        </div>
      </div>
    );
  }
}

UnitsHealthNodeDetailPanel.propTypes = {
  docsURL: React.PropTypes.string,
  healthStatus: React.PropTypes.string,
  healthStatusClassNames: React.PropTypes.string,
  hostIP: React.PropTypes.string,
  pageHeaderTitle: React.PropTypes.string,
  output: React.PropTypes.string,
  summary: React.PropTypes.string
};

module.exports = UnitsHealthNodeDetailPanel;

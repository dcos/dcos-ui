import React from 'react';

import DescriptionList from './DescriptionList';
import Icon from './Icon';
import MarathonConfigUtil from '../utils/MarathonConfigUtil';

const METHODS_TO_BIND = [
];

class PodContainerSpecView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getGeneralDetails() {
    let {container} = this.props;
    let {cpus, mem, disk} = container.resources;
    let hash = {
      'Name': container.name,
      'CPUs': cpus,
      'Memory (MiB)': mem,
      'Disk Space (Mib)': disk,
      'Command': MarathonConfigUtil.getCommandString(container)
    };

    return <DescriptionList hash={hash} />;
  }

  getLabelSection() {
    let {container} = this.props;
    if (!container.labels || !Object.keys(container.labels).length) {
      return null;
    }

    return (
      <div>
        <h5 className="inverse flush-top">Labels</h5>
        <DescriptionList hash={container.labels} />
      </div>
      );
  }

  getEndpointsSection() {
    let {container} = this.props;
    let {id, endpoints} = container;
    if (!endpoints || !endpoints.length) {
      return null;
    }

    let portConfigurations = MarathonConfigUtil.getPortDefinitionGroups(
        id, endpoints, function (content, linkTo) {
          return <a href={linkTo} target="_blank">{content}</a>;
        }
      ).map(function ({hash, headline}, index) {
        return (
          <DescriptionList className="nested-description-list"
            hash={hash}
            headline={headline}
            key={index} />
          );
      });

    return (
      <div>
        <h5 className="inverse flush-top">Port Definitions</h5>
        {portConfigurations}
      </div>
      );
  }

  render() {
    let {container} = this.props;
    return (
      <div className="pod-config-container">
        <h5 className="inverse flush-top">
          <Icon
            className="icon-margin-right"
            color="white"
            family="mini"
            id="gears"
            size="mini" />
          {container.name}
        </h5>
        <div className="pod-config-resource-group pod-config-resource-group-container">
          {this.getGeneralDetails()}
          {this.getEndpointsSection()}
        </div>
      </div>
      );
  }
};

PodContainerSpecView.contextTypes = {
  router: React.PropTypes.func
};

PodContainerSpecView.propTypes = {
  container: React.PropTypes.object
};

module.exports = PodContainerSpecView;

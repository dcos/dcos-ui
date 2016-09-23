import React from 'react';

import DescriptionList from './DescriptionList';
import ServiceConfigUtil from '../utils/ServiceConfigUtil';

class PodContainerSpecView extends React.Component {
  getGeneralDetails() {
    let {container} = this.props;
    let {cpus, mem, disk} = container.resources;
    let hash = {
      'Name': container.name,
      'CPUs': cpus,
      'Memory (MiB)': mem,
      'Disk Space (Mib)': disk,
      'Command': ServiceConfigUtil.getCommandString(container)
    };

    return <DescriptionList hash={hash} />;
  }

  getEnvironmentSection() {
    let {container: {environment={}}} = this.props;

    if (Object.keys(environment).length === 0) {
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
    let {container: {id, endpoints=[]}} = this.props;

    if (!endpoints.length) {
      return null;
    }

    let portConfigurations = ServiceConfigUtil.getPortDefinitionGroups(
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
    let {container: {name}} = this.props;

    return (
      <div className="pod-config-container">
        <h5 className="inverse flush-top">
          {name}
        </h5>
        {this.getGeneralDetails()}
        {this.getEndpointsSection()}
      </div>
    );
  }
};

PodContainerSpecView.propTypes = {
  container: React.PropTypes.object
};

module.exports = PodContainerSpecView;

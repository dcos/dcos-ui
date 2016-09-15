import React from 'react';

import DescriptionList from './DescriptionList';
import Pod from '../structs/Pod';

const sectionClassName = 'container-fluid container-pod container-pod-super-short flush flush-bottom';

const METHODS_TO_BIND = [
];

class PodConfigurationView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getContainerDetails(container) {
    let hash = {

    };
    return (
        <DescriptionList className="nested-description-list"
          hash={hash}
          headline={container.name}
          />
      );
  }

  getGeneralDetails(spec) {
    let hash = {
      'ID': spec.getId()
    };

    return <DescriptionList hash={hash} />;
  }

  getSpecDetails(spec) {
    return (
      <div>
        <div className={sectionClassName}>
          <h5 className="inverse flush-top">
            General
          </h5>
          {this.getGeneralDetails(spec)}
        </div>
        <div className={sectionClassName}>
          <h5 className="inverse flush-top">
            Containers
          </h5>
          {spec.getContainers().map(this.getContainerDetails)}
        </div>
      </div>
      );
  }

  render() {
    let spec = this.props.pod.getSpec();
    let localeVersion = new Date(spec.getVersion()).toLocaleString();
    return (
        <div>
          <h4 className="inverse flush-top">
            Current Version ({localeVersion})
          </h4>
          {this.getSpecDetails(spec)}
        </div>
      );
  }
};

PodConfigurationView.contextTypes = {
  router: React.PropTypes.func
};

PodConfigurationView.propTypes = {
  pod: React.PropTypes.instanceOf(Pod)
};

module.exports = PodConfigurationView;

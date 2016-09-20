import React from 'react';

import DescriptionList from './DescriptionList';
import PodSpec from '../structs/PodSpec';

const METHODS_TO_BIND = [
];

class PodSpecView extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getGeneralDetails() {
    let {spec} = this.props;
    let hash = {
      'ID': spec.getId()
    };

    return <DescriptionList hash={hash} />;
  }

  render() {
    let {spec} = this.props;

    return (
      <div>
        <h4 className="inverse flush-top">
          General
        </h4>
        {this.getGeneralDetails(spec)}
      </div>
      );
  }
};

PodSpecView.contextTypes = {
  router: React.PropTypes.func
};

PodSpecView.propTypes = {
  spec: React.PropTypes.instanceOf(PodSpec)
};

module.exports = PodSpecView;

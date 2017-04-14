import {MountService} from 'foundation-ui';
import React from 'react';

import RequestErrorMsg from './RequestErrorMsg';

class ContextualXHRError extends React.Component {
  render() {
    return (
      <MountService.Mount
        limit={1}
        type="ContextualXHRError"
        xhr={this.props.xhr}>
        <RequestErrorMsg />
      </MountService.Mount>
    );
  }
}

ContextualXHRError.propTypes = {
  xhr: React.PropTypes.shape({
    status: React.PropTypes.number.isRequired
  }).isRequired
};

module.exports = ContextualXHRError;

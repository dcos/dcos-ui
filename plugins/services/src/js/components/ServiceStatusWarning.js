import React, {Component} from 'react';
import {Tooltip} from 'reactjs-components';

import DateUtil from '../../../../../src/js/utils/DateUtil';
import DeclinedOffersUtil from '../utils/DeclinedOffersUtil';
import Icon from '../../../../../src/js/components/Icon';
import Pod from '../structs/Pod';
import Service from '../structs/Service';
import ServiceTree from '../structs/ServiceTree';

class ServiceStatusWarning extends Component {
  getTooltipContent(timeWaiting) {
    return `DC/OS has been waiting for resources and unable to complete this deployment for ${DateUtil.getDuration(timeWaiting, null)}.`;
  }
  render() {
    const {item} = this.props;
    const queue = item.getQueue();

    if (queue != null
      && DeclinedOffersUtil.shouldDisplayDeclinedOffersWarning(queue)) {
      const waitingSince = DateUtil.strToMs(queue.since);
      const timeWaiting = Date.now() - waitingSince;

      return (
        <Tooltip
          content={this.getTooltipContent(timeWaiting)}
          width={250}
          wrapText={true}
          wrapperClassName="tooltip-wrapper status-waiting-indicator">
          <Icon color="red" id="yield" size="mini" />
        </Tooltip>
      );
    }

    return <noscript />;
  }
};

ServiceStatusWarning.propTypes = {
  item: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Service),
    React.PropTypes.instanceOf(ServiceTree),
    React.PropTypes.instanceOf(Pod)
  ])
};

module.exports = ServiceStatusWarning;

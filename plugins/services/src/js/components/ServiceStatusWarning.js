import React, {Component} from 'react';
import {Tooltip} from 'reactjs-components';

import DateUtil from '../../../../../src/js/utils/DateUtil';
import DeclinedOffersUtil from '../utils/DeclinedOffersUtil';
import Icon from '../../../../../src/js/components/Icon';
import Pod from '../structs/Pod';
import Service from '../structs/Service';
import ServiceTree from '../structs/ServiceTree';
import StringUtil from '../../../../../src/js/utils/StringUtil';

class ServiceStatusWarning extends Component {
  getTooltip(content) {
    return (
      <Tooltip
        content={content}
        width={250}
        wrapText={true}
        wrapperClassName="tooltip-wrapper status-waiting-indicator">
        <Icon color="red" id="yield" size="mini" />
      </Tooltip>
    );
  }

  render() {
    const {item} = this.props;

    if (item instanceof ServiceTree) {
      const appsWithDeclinedOffers = DeclinedOffersUtil
        .getAppsWithDeclinedOffersFromServiceTree(item);
      const appCount = appsWithDeclinedOffers.length;

      if (appCount > 0) {
        const appsNoun = StringUtil.pluralize('service', appCount);

        return this.getTooltip(`DC/OS is waiting for resources and is unable to complete the deployment of ${appCount} ${appsNoun} in this group.`);
      }
    } else {
      const queue = item.getQueue();

      if (DeclinedOffersUtil.shouldDisplayDeclinedOffersWarning(queue)) {
        const timeWaiting = DeclinedOffersUtil.getTimeWaiting(queue);

        return this.getTooltip(`DC/OS has been waiting for resources and is unable to complete this deployment for ${DateUtil.getDuration(timeWaiting, null)}.`);
      }
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

import React from 'react';
import {Tooltip} from 'reactjs-components';

import DateUtil from '../../../../../src/js/utils/DateUtil';
import Icon from '../../../../../src/js/components/Icon';
import Pod from '../structs/Pod';
import Service from '../structs/Service';
import ServiceTree from '../structs/ServiceTree';

const DEPLOYMENT_WARNING_DELAY_MS = 1000 * 60 * 5;

const getTooltipContent = (timeWaiting, showDebugInstruction) => {
  const additionalCopy = showDebugInstruction
    ? ' See more information in the debug tab.'
    : '';

  return `DC/OS has been waiting for resources and unable to complete this deployment for ${DateUtil.getDuration(timeWaiting, null)}.${additionalCopy}`;
};

const ServiceStatusWarning = ({item, showDebugInstruction}) => {
  queue = item.getQueue();

  if (queue != null) {
    const waitingSince = DateUtil.strToMs(queue.since);
    const timeWaiting = Date.now() - waitingSince;

    // If the item has been waiting for less than five minutes, we don't
    // display the warning.
    if (timeWaiting >= DEPLOYMENT_WARNING_DELAY_MS) {
      return (
        <Tooltip
          content={getTooltipContent(timeWaiting, showDebugInstruction)}
          width={250}
          wrapText={true}
          wrapperClassName="tooltip-wrapper status-waiting-indicator">
          <Icon color="red" id="yield" size="mini" />
        </Tooltip>
      );
    }
  }

  return <noscript />;
};

ServiceStatusWarning.defaultProps = {
  showDebugInstruction: false
};

ServiceStatusWarning.propTypes = {
  item: React.PropTypes.oneOfType([
    React.PropTypes.instanceOf(Service),
    React.PropTypes.instanceOf(ServiceTree),
    React.PropTypes.instanceOf(Pod)
  ]),
  showDebugInstruction: React.PropTypes.bool
};

module.exports = ServiceStatusWarning;

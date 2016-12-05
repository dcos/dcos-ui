import React from 'react';
import {Tooltip} from 'reactjs-components';

import Icon from '../../../../../src/js/components/Icon';

const DeleteRowButton = ({onClick}) => {
  return (
    <a
      className="button button-primary-link button-flush"
      onClick={onClick}>
      <Tooltip
        content="Delete"
        interactive={true}
        maxWidth={300}
        scrollContainer=".gm-scroll-view"
        wrapText={true}>
        <Icon id="close" family="tiny" color="grey" size="tiny" />
      </Tooltip>
    </a>

  );
};

module.exports = DeleteRowButton;

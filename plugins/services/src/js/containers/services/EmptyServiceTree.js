import React, {PropTypes} from 'react';

import AlertPanel from '../../../../../../src/js/components/AlertPanel';
import Icon from '../../../../../../src/js/components/Icon';

const EmptyServiceTree = function ({ onCreateGroup, onCreateService }) {

  const icon = <Icon id="services" color="neutral" size="jumbo" />;
  const footer = (
   <div className="button-collection flush-bottom">
      <button className="button button-stroke"
        onClick={onCreateGroup}>
        Create Group
      </button>
      <button className="button button-success"
        onClick={onCreateService}>
        Deploy Service
      </button>
    </div>
  );

  return (
    <AlertPanel
      title="No Services Deployed"
      footer={footer}
      icon={icon}>
      <p className="flush-bottom">
        Create groups to organize your services or
        deploy a new service.
      </p>
    </AlertPanel>
  );
};

EmptyServiceTree.defaultProps = {
  onCreateGroup: () => {},
  onCreateService: () => {}
};

EmptyServiceTree.propTypes = {
  onCreateGroup: PropTypes.func,
  onCreateService: PropTypes.func
};

module.exports = EmptyServiceTree;

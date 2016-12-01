import React, {PropTypes} from 'react';

import AlertPanel from '../../../../../../src/js/components/AlertPanel';

const EmptyServiceTree = function ({ onCreateService }) {

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
      >
      <p className="tall">
        Create groups to organize your services or deploy a new service.
      </p>
      {footer}
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

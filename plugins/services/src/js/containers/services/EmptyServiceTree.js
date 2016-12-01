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
        Run a Service
      </button>
    </div>
  );

  return (
    <AlertPanel
      title="No running services">
      <p className="tall">
        Run a new service or create a new group to help organize your services.
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

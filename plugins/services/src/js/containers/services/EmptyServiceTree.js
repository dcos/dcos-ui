/* @flow */
import React, { PropTypes } from "react";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

type Props = {
  onCreateGroup?: Function,
  onCreateService?: Function,
};

const EmptyServiceTree = function(props: Props) {
  const { onCreateGroup, onCreateService } = props;
  const footer = (
    <div className="button-collection flush-bottom">
      <button className="button button-stroke" onClick={onCreateGroup}>
        Create Group
      </button>
      <button className="button button-success" onClick={onCreateService}>
        Run a Service
      </button>
    </div>
  );

  return (
    <AlertPanel>
      <AlertPanelHeader>No running services</AlertPanelHeader>
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

module.exports = EmptyServiceTree;

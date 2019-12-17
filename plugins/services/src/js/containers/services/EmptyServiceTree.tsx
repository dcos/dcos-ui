import PropTypes from "prop-types";
import * as React from "react";
import { Trans } from "@lingui/macro";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

const EmptyServiceTree = ({ onCreateGroup, onCreateService }) => {
  const footer = (
    <div className="button-collection flush-bottom">
      <Trans
        render={
          <button
            className="button button-primary-link"
            onClick={onCreateGroup}
          />
        }
      >
        Create a Group
      </Trans>
      <Trans
        render={
          <button className="button button-primary" onClick={onCreateService} />
        }
      >
        Run a Service
      </Trans>
    </div>
  );

  return (
    <AlertPanel>
      <Trans render={<AlertPanelHeader />}>No running services</Trans>
      <Trans render="p" className="tall">
        Run a new service or create a new group to help organize your services.
      </Trans>
      {footer}
    </AlertPanel>
  );
};

EmptyServiceTree.defaultProps = {
  onCreateGroup: () => undefined,
  onCreateService: () => undefined
};

EmptyServiceTree.propTypes = {
  onCreateGroup: PropTypes.func,
  onCreateService: PropTypes.func
};

export default EmptyServiceTree;

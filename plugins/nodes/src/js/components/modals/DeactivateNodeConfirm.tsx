import React, { useState } from "react";
import { i18nMark, withI18n } from "@lingui/react";

// @ts-ignore
import { request } from "@dcos/mesos-client";
import { Trans } from "@lingui/macro";
import { InfoBoxInline } from "@dcos/ui-kit";

// @ts-ignore
import { Confirm } from "reactjs-components";

import Node from "#SRC/js/structs/Node";
import NodeMaintenanceActions from "#PLUGINS/nodes/src/js/actions/NodeMaintenanceActions";

interface Props {
  open: boolean;
  onClose: () => void;
  node: Node | null;
  i18n: any;
}

function DeactivateNodeConfirm(props: Props) {
  const { open, onClose, node, i18n } = props;

  const [inProgress, setInProgress] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<React.ReactElement | null>(
    null
  );

  let [prevOpenState, setPrevOpenState] = useState<boolean | null>(null);

  // Reset form when closed
  if (open !== prevOpenState) {
    if (!open) {
      setNetworkError(null);
      setInProgress(false);
    }
    setPrevOpenState(open);
  }

  const handleDeactivate = (node: Node | null, onClose: () => void) => {
    if (node == null) {
      return;
    }

    setInProgress(true);

    NodeMaintenanceActions.deactivateNode(node, {
      onSuccess: () => onClose(),
      onError: ({ code, message }: { code: number; message: string }) => {
        setInProgress(true);
        setNetworkError(
          code === 0 ? (
            <Trans>Network is offline</Trans>
          ) : (
            <Trans>
              Unable to complete request. Please try again. The error returned
              was {code} {message}
            </Trans>
          )
        );
      }
    });
  };

  const deactivateText = inProgress
    ? i18n._(i18nMark("Deactivating..."))
    : i18n._(i18nMark("Deactivate"));

  return (
    <Confirm
      closeByBackdropClick={true}
      disabled={inProgress}
      header={<Trans render="strong">Deactivate Node</Trans>}
      open={open}
      onClose={onClose}
      rightButtonCallback={handleDeactivate.bind(null, node, onClose)}
      leftButtonCallback={onClose}
      leftButtonClassName="button button-primary-link flush-left"
      leftButtonText={i18n._(i18nMark("Cancel"))}
      rightButtonClassName="button button-danger"
      rightButtonText={deactivateText}
      showHeader={true}
    >
      {networkError && (
        <InfoBoxInline
          appearance="danger"
          className="error-unanchored"
          message={networkError}
        />
      )}
      <Trans>Are you sure you want to deactivate this node?</Trans>
    </Confirm>
  );
}

const DeactivateNodeConfirmWithI18n = withI18n()(DeactivateNodeConfirm);

export { DeactivateNodeConfirmWithI18n as default };

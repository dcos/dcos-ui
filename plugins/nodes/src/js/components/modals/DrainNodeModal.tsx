import * as React from "react";

import { Trans } from "@lingui/macro";
import { Modal } from "reactjs-components";
import { InfoBoxInline } from "@dcos/ui-kit";

import Node from "#SRC/js/structs/Node";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import NodeMaintenanceActions from "#PLUGINS/nodes/src/js/actions/NodeMaintenanceActions";

import DrainNodeForm, { DrainOptions } from "../DrainNodeForm";

interface Props {
  open: boolean;
  onClose: () => void;
  node: Node | null;
}

const DEFAULT_DRAIN_OPTIONS: DrainOptions = {
  maxGracePeriod: null,
  decommission: false,
};

function DrainNodeModal(props: Props) {
  const { open, onClose, node } = props;

  const [prevOpenState, setPrevOpenState] = React.useState<boolean | null>(
    null
  );

  const [drainOptions, setDrainOptions] = React.useState<DrainOptions>(
    DEFAULT_DRAIN_OPTIONS
  );

  const [inProgress, setInProgress] = React.useState<boolean>(false);
  const [
    networkError,
    setNetworkError,
  ] = React.useState<React.ReactElement | null>(null);

  const handleDrainOptions = (options: Partial<DrainOptions>) => {
    setDrainOptions({ ...drainOptions, ...options });
  };

  // Reset form when closed
  if (open !== prevOpenState) {
    if (!open) {
      setDrainOptions(DEFAULT_DRAIN_OPTIONS);
    }
    setPrevOpenState(open);
  }

  const handleDrain = (node: Node | null) => {
    if (node != null) {
      setInProgress(true);

      NodeMaintenanceActions.drainNode(node, drainOptions, {
        onSuccess: () => {
          setNetworkError(null);
          setInProgress(false);
          onClose();
        },
        onError: ({ code, message }: { code: number; message: string }) => {
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
          setInProgress(false);
        },
      });
    }
  };

  const getFooter = (props: Props) => {
    const { onClose } = props;

    return (
      <div className="flush-bottom flex flex-direction-top-to-bottom flex-align-items-stretch-screen-small flex-direction-left-to-right-screen-small flex-justify-items-space-between-screen-medium">
        <button
          className="button button-primary-link flush-left"
          onClick={onClose}
        >
          <Trans>Cancel</Trans>
        </button>
        <button
          className="button button-primary"
          onClick={handleDrain.bind(null, props.node)}
          disabled={inProgress}
        >
          <Trans>Drain</Trans>
        </button>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      modalClass="modal modal-small"
      showHeader={true}
      showFooter={true}
      footer={getFooter(props)}
      header={
        <ModalHeading>
          <Trans render="span">Drain Node</Trans>
        </ModalHeading>
      }
    >
      {networkError && (
        <div className="form-row-pad-bottom">
          <InfoBoxInline
            className="error-unanchored"
            appearance="danger"
            message={networkError}
          />
        </div>
      )}
      {node && (
        <DrainNodeForm onChange={handleDrainOptions} formData={drainOptions} />
      )}
    </Modal>
  );
}

export { DrainNodeModal as default };

import { Trans, t } from "@lingui/macro";
import { withI18n, i18nMark } from "@lingui/react";
import React from "react";
import Config from "#SRC/js/config/Config";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import { Confirm } from "reactjs-components";

const RepositoriesDeleteConfirmMessage = ({ repository, error, i18n }) => {
  const label = repository
    ? repository.get("name")
    : i18n._(t`This repository`);
  const errorMessage = <p className="text-error-state">{error}</p>;

  return (
    <div>
      <Trans render="p">
        Repository ({label}) will be deleted from {Config.productName}. You will
        not be able to install any packages belonging to that repository
        anymore.
      </Trans>
      {error ? errorMessage : ""}
    </div>
  );
};

const RepositoriesDeleteConfirm = ({
  onCancel,
  onDelete,
  open,
  pendingRequest,
  repository,
  deleteError,
  i18n
}) => {
  const heading = (
    <ModalHeading>
      <Trans render="span">Delete Repository</Trans>
    </ModalHeading>
  );
  const rightButtonText = i18nMark("Delete Repository");

  return (
    <Confirm
      closeByBackdropClick={true}
      header={heading}
      leftButtonClassName="button button-primary-link flush-left"
      rightButtonClassName="button button-danger"
      rightButtonText={i18n._(rightButtonText)}
      showHeader={true}
      onClose={onCancel}
      leftButtonCallback={onCancel}
      rightButtonCallback={onDelete}
      disabled={pendingRequest}
      open={open}
    >
      <RepositoriesDeleteConfirmMessage
        repository={repository}
        error={deleteError}
        i18n={i18n}
      />
    </Confirm>
  );
};

export default withI18n()(RepositoriesDeleteConfirm);

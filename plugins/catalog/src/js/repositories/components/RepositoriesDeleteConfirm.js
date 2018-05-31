import React from "react";
import Config from "#SRC/js/config/Config";
import ModalHeading from "#SRC/js/components/modals/ModalHeading";
import { Confirm } from "reactjs-components";
import UserActions from "#SRC/js/constants/UserActions";
import StringUtil from "#SRC/js/utils/StringUtil";

const RepositoriesDeleteConfirmMessage = ({ repository, error }) => {
  const label = repository ? repository.get("name") : "This repository";
  const errorMessage = <p className="text-error-state">{error}</p>;

  return (
    <div>
      <p>
        {`Repository (${label}) will be ${UserActions.DELETED}
          from ${Config.productName}. You will not be able to install any
          packages belonging to that repository anymore.`}
      </p>
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
  deleteError
}) => {
  const heading = <ModalHeading>Delete Repository</ModalHeading>;
  const rightButtonText = `${StringUtil.capitalize(
    UserActions.DELETE
  )} Repository`;

  return (
    <Confirm
      closeByBackdropClick={true}
      header={heading}
      leftButtonClassName="button button-primary-link flush-left"
      rightButtonClassName="button button-danger"
      rightButtonText={rightButtonText}
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
      />
    </Confirm>
  );
};

export default RepositoriesDeleteConfirm;

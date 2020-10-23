import * as React from "react";
import { I18n, i18nMark } from "@lingui/core";
import { Trans } from "@lingui/macro";
import FullScreenModalHeader from "#SRC/js/components/modals/FullScreenModalHeader";
import FullScreenModalHeaderActions from "#SRC/js/components/modals/FullScreenModalHeaderActions";

interface GroupModalHeaderProps {
  i18n: I18n;
  mode: "create" | "edit" | "force";
  onClose: () => void;
  onSave: () => void;
}

export default (props: GroupModalHeaderProps) => {
  const { i18n, mode, onClose, onSave } = props;
  const cancelLabel = i18n._(i18nMark("Cancel"));
  let saveLabel;
  switch (mode) {
    case "create":
      saveLabel = i18n._(i18nMark("Create"));
      break;
    case "edit":
      saveLabel = i18n._(i18nMark("Update"));
      break;
    case "force":
      saveLabel = i18n._(i18nMark("Force Update"));
      break;
  }
  return (
    <FullScreenModalHeader>
      <FullScreenModalHeaderActions
        actions={[
          {
            className: "button-primary-link button-flush-horizontal",
            clickHandler: onClose,
            label: cancelLabel,
          },
        ]}
        type="secondary"
      />
      <div className="modal-full-screen-header-title">
        {mode === "create" ? (
          <Trans>New Group</Trans>
        ) : (
          <Trans>Edit Group</Trans>
        )}
      </div>
      <FullScreenModalHeaderActions
        actions={[
          {
            className:
              mode === "force"
                ? "button-danger flush-vertical"
                : "button-primary flush-vertical",
            clickHandler: onSave,
            label: saveLabel,
          },
        ]}
        type="primary"
      />
    </FullScreenModalHeader>
  );
};

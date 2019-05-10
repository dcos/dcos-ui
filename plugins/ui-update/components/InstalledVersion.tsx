import * as React from "react";
import { Trans } from "@lingui/macro";
import * as semver from "semver";

import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import { UIMetadata } from "#SRC/js/data/ui-update/UIMetadata";
import {
  UIAction,
  UIActions,
  UIActionType
} from "#PLUGINS/ui-update/types/UIAction";

interface InstalledVersionProps {
  uiMetaData: UIMetadata | null;
  uiAction?: UIAction;
  onRollbackClick?: () => void;
}
function refreshPage() {
  location.reload();
}

function renderRollbackAction(uiAction: UIAction): React.ReactNode {
  let defaultContent = <Trans>Rollback</Trans>;
  if (uiAction.type !== UIActionType.Reset) {
    return defaultContent;
  }
  switch (uiAction.action) {
    case UIActions.Started:
      return <Trans>Rolling back...</Trans>;
    case UIActions.Error:
      return <Trans>Rollback Failed!</Trans>;
    default:
      return defaultContent;
  }
}

function rollbackActionDisabled(uiAction: UIAction | undefined): boolean {
  if (!uiAction) {
    return true;
  }
  if (uiAction.type === UIActionType.None) {
    return false;
  }
  if (uiAction.type === UIActionType.Reset) {
    return (
      uiAction.action === UIActions.Started ||
      uiAction.action === UIActions.Error
    );
  }
  return uiAction.action === UIActions.Started;
}

function renderRollbackContent(props: InstalledVersionProps) {
  if (!props.uiAction) {
    return null;
  }
  return (
    <button
      id="uiDetailsRollback"
      className="button button-primary-link"
      onClick={props.onRollbackClick}
      disabled={rollbackActionDisabled(props.uiAction)}
    >
      {renderRollbackAction(props.uiAction)}
    </button>
  );
}

const InstalledVersion = (props: InstalledVersionProps) => {
  const { uiMetaData } = props;
  if (!uiMetaData || !uiMetaData.clientBuild) {
    return null;
  }
  const { clientBuild, serverBuild } = uiMetaData;

  let refreshForUpdateContent = null;

  const coercedClientBuild = semver.coerce(clientBuild);
  const coercedServerBuild = semver.coerce(serverBuild || "");
  const displayVersion =
    coercedClientBuild === null
      ? uiMetaData.clientBuild
      : coercedClientBuild.raw;

  if (
    coercedClientBuild !== null &&
    coercedServerBuild != null &&
    coercedClientBuild.raw !== coercedServerBuild.raw &&
    !rollbackActionDisabled(props.uiAction)
  ) {
    refreshForUpdateContent = (
      <button
        id="uiDetailsRefreshVersion"
        className="button button-primary-link"
        onClick={refreshPage}
      >
        <Trans>Refresh page to load</Trans> ({coercedServerBuild.raw})
      </button>
    );
  }

  return (
    <ConfigurationMapRow key="installedVersion">
      <ConfigurationMapLabel>
        <Trans>Installed Version</Trans>
      </ConfigurationMapLabel>
      <ConfigurationMapValue>{displayVersion}</ConfigurationMapValue>
      {refreshForUpdateContent}
      {renderRollbackContent(props)}
    </ConfigurationMapRow>
  );
};

export default InstalledVersion;

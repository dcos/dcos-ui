import { Trans } from "@lingui/macro";
import * as React from "react";

import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import {
  UIAction,
  UIActions,
  UIActionType
} from "#PLUGINS/ui-update/types/UIAction";
import { FormattedPackageVersion } from "#PLUGINS/ui-update/types/FormattedPackageVersion";

export interface AvailableUpdateRowProps {
  latestVersion: FormattedPackageVersion | null;
  uiAction: UIAction;
  onUpdateClick: (version: string) => void;
}

class AvailableUpdateRow extends React.PureComponent<
  AvailableUpdateRowProps,
  {}
> {
  private static renderActionContent(uiAction: UIAction): React.ReactNode {
    if (uiAction.type !== UIActionType.Update) {
      return <Trans>Start Update</Trans>;
    }
    switch (uiAction.action) {
      case UIActions.Completed:
        return <Trans>Update Complete</Trans>;
      case UIActions.Started:
        return <Trans>Updating...</Trans>;
      case UIActions.Error:
        return <Trans>Update Failed!</Trans>;
      default:
        return <Trans>Start Update</Trans>;
    }
  }

  private static actionDisabled(uiAction: UIAction): boolean {
    return (
      uiAction.type === UIActionType.Update ||
      (uiAction.type !== UIActionType.None &&
        uiAction.action !== UIActions.Completed &&
        uiAction.action !== UIActions.Error)
    );
  }

  constructor(props: AvailableUpdateRowProps) {
    super(props);
    this.handleUpdateClick = this.handleUpdateClick.bind(this);
    this.renderAction = this.renderAction.bind(this);
  }

  handleUpdateClick() {
    if (this.props.latestVersion !== null) {
      this.props.onUpdateClick(this.props.latestVersion.version);
    }
  }

  renderAction() {
    const { uiAction } = this.props;
    return (
      <button
        id="uiDetailsStartUpdate"
        className="button button-primary-link"
        onClick={this.handleUpdateClick}
        disabled={AvailableUpdateRow.actionDisabled(uiAction)}
      >
        {AvailableUpdateRow.renderActionContent(uiAction)}
      </button>
    );
  }

  render() {
    const { latestVersion } = this.props;
    if (latestVersion === null) {
      return null;
    }
    const displayVersion =
      latestVersion.display !== null
        ? latestVersion.display.raw
        : latestVersion.version;

    return (
      <ConfigurationMapRow key="ui-update-available">
        <ConfigurationMapLabel>
          <Trans>Available Version</Trans>
        </ConfigurationMapLabel>
        <ConfigurationMapValue>
          {displayVersion} (<Trans>New</Trans>)
        </ConfigurationMapValue>
        {this.renderAction()}
      </ConfigurationMapRow>
    );
  }
}

export default AvailableUpdateRow;

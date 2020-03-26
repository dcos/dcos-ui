import * as React from "react";
import { Trans } from "@lingui/macro";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";

const EmptySecretsTable = ({
  handleSecretFormOpen,
}: {
  handleSecretFormOpen: () => void;
}) => (
  <AlertPanel>
    <AlertPanelHeader>
      <Trans>No active secrets</Trans>
    </AlertPanelHeader>
    <Trans render="p" className="tall">
      Create secrets to secure sensitive information like database passwords,
      API tokens, and private keys.
    </Trans>
    <div className="button-collection flush-bottom">
      <button className="button button-primary" onClick={handleSecretFormOpen}>
        <Trans>Create Secret</Trans>
      </button>
    </div>
  </AlertPanel>
);

export default EmptySecretsTable;

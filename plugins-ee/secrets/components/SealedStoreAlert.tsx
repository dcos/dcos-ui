import { Trans } from "@lingui/macro";
import * as React from "react";

import AlertPanel from "#SRC/js/components/AlertPanel";
import AlertPanelHeader from "#SRC/js/components/AlertPanelHeader";
import MetadataStore from "#SRC/js/stores/MetadataStore";

export default class SealedStoreAlert extends React.Component {
  render() {
    const docsLink = MetadataStore.buildDocsURI(
      "/security/ent/secrets/unseal-store/"
    );

    return (
      <AlertPanel>
        <AlertPanelHeader>
          <Trans render="span">Secret store sealed</Trans>
        </AlertPanelHeader>
        <Trans render="p" className="flush-bottom">
          The contents of this secret store cannot be accessed until it is
          unsealed. See{" "}
          <a href={docsLink} target="_blank">
            instructions
          </a>{" "}
          on how to access sealed secret stores.
        </Trans>
      </AlertPanel>
    );
  }
}

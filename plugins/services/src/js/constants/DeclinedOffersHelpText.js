import { Trans } from "@lingui/macro";
import React from "react";

import MetadataStore from "#SRC/js/stores/MetadataStore";

const summaryDocsURL = MetadataStore.buildDocsURI(
  "/overview/concepts/#mesos-resource-offer"
);

export default {
  summaryIntro: (
    <Trans render="span">
      When you attempt to deploy a service, DC/OS waits for offers to match the{" "}
      resources your service requires. If the offer does not satisfy the{" "}
      requirement, it is declined and DC/OS retries.{" "}
      <a href={summaryDocsURL} target="_blank">
        Learn more
      </a>.
    </Trans>
  )
};

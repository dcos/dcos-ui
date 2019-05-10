import * as React from "react";
import { Trans } from "@lingui/macro";

import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Loader from "#SRC/js/components/Loader";
import { DEFAULT_UI_METADATA } from "#SRC/js/data/ui-update/UIMetadata";
import InstalledVersion from "#PLUGINS/ui-update/components/InstalledVersion";

const Loading = () => <Loader size="small" type="ballBeat" />;

export default () => {
  return (
    <ConfigurationMapSection>
      <InstalledVersion uiMetaData={DEFAULT_UI_METADATA} />
      <ConfigurationMapValue>
        <Trans>Checking for new version</Trans>
        <Loading />
      </ConfigurationMapValue>
    </ConfigurationMapSection>
  );
};

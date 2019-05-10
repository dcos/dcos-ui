import * as React from "react";

import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import InstalledVersion from "#PLUGINS/ui-update/components/InstalledVersion";
import { DEFAULT_UI_METADATA } from "#SRC/js/data/ui-update/UIMetadata";

export default () => {
  // If the stream errors fallback to displaying just the local build version
  // based on window.DCOS_UI_VERSION
  return (
    <ConfigurationMapSection>
      <InstalledVersion uiMetaData={DEFAULT_UI_METADATA} />
    </ConfigurationMapSection>
  );
};

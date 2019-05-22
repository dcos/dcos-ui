import * as React from "react";
import { MountService } from "foundation-ui";
import { withI18n } from "@lingui/react";

import ErrorsAlert from "#SRC/js/components/ErrorsAlert";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";

import { translateErrorMessages } from "./form/helpers/ErrorUtil";
import GeneralConfigSection from "./config/GeneralConfigSection";
import { JobOutput, FormError } from "./form/helpers/JobFormData";

const PRIORITIES_PAD_NUMBER = 100;
const DEFAULT_DISPLAY_COMPONENTS = [
  {
    MOUNT_TYPE: "CreateJob:JobConfigDisplay:App",
    COMPONENTS: [GeneralConfigSection]
  }
];

const JobsErrorPathMapping: any[] = [];

// Register default config display components (this needs to only happen once)
DEFAULT_DISPLAY_COMPONENTS.forEach(({ MOUNT_TYPE, COMPONENTS }) => {
  COMPONENTS.forEach((component, index, componentArray) => {
    // Define  component priorities based on index (highest prio goes first)
    // and pad priorities, so that we can add components in between.
    const priority = (componentArray.length - index) * PRIORITIES_PAD_NUMBER;
    MountService.MountService.registerComponent(
      component,
      MOUNT_TYPE,
      priority
    );
  });
});

interface JobsConfigProps {
  config: JobOutput;
  i18n: any;
  errors?: FormError[];
  onEditClick?: () => void;
}

class JobsConfig extends React.Component<JobsConfigProps, object> {
  getMountType() {
    return "CreateJob:JobConfigDisplay:App";
  }

  getErrors() {
    const { errors, i18n } = this.props;
    return translateErrorMessages(errors || [], i18n);
  }

  render() {
    const { config, onEditClick } = this.props;
    const errorsAlert = (
      <ErrorsAlert
        errors={this.getErrors()}
        pathMapping={JobsErrorPathMapping}
      />
    );

    return (
      <ConfigurationMap>
        {errorsAlert}
        <MountService.Mount
          config={config}
          errors={errorsAlert}
          onEditClick={onEditClick}
          type={this.getMountType()}
        />
      </ConfigurationMap>
    );
  }
}

export default withI18n()(JobsConfig);

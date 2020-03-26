import * as React from "react";
import { InfoBoxInline } from "@dcos/ui-kit";
import { Trans } from "@lingui/macro";

import { SecretVolume } from "#PLUGINS/jobs/src/js/components/form/helpers/JobFormData";

interface JobVolumesFBSProps {
  volumes: SecretVolume[];
}

class JobVolumesFBS extends React.Component<JobVolumesFBSProps, {}> {
  public render() {
    const { volumes } = this.props;
    const containerPaths = volumes
      .filter((volume) => volume.containerPath)
      .map((volume) => volume.containerPath);

    if (containerPaths == null || !containerPaths.length) {
      return null;
    }

    const content = (
      <div>
        <Trans render="p">
          The following paths are being used by file-based secrets. Use
          different paths from those listed below for your volume container
          paths:
        </Trans>
        <ul className="flush-bottom">
          {containerPaths.map((path, index) => (
            <li key={`fbs.${index}`}>{path}</li>
          ))}
        </ul>
      </div>
    );

    return (
      <div className="form-inner-section">
        <InfoBoxInline message={content} />
      </div>
    );
  }
}

export default JobVolumesFBS;

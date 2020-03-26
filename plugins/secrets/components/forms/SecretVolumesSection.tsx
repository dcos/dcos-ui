import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";
import { InfoBoxInline } from "@dcos/ui-kit";

function makeDisplayVolumes(disp, volume) {
  const splitVolumes = volume.split("/");
  if (splitVolumes.length > 0 && !disp.includes(splitVolumes[0])) {
    disp.push(splitVolumes[0]);
  }

  return disp;
}

const SecretVolumesSection = (props) => {
  const data = props.data.secrets || [];
  const secretVolumes = data.reduce((volumes, secret) => {
    if (secret.exposures) {
      secret.exposures
        .filter((exposure) => exposure.type === "file" && exposure.value)
        .forEach((exposure) => {
          volumes.push(exposure.value);
        });
    }

    return volumes;
  }, []);
  if (secretVolumes.length === 0) {
    return null;
  }
  const displayVolumes = secretVolumes.reduce(makeDisplayVolumes, []);
  const content = (
    <div>
      <Trans render="p">
        The following paths are being used by file-based secrets. Use different
        paths from those listed below for your volume container paths:
      </Trans>
      <ul className="flush-bottom">
        {displayVolumes.map((path, index) => (
          <li key={`fbs.${index}`}>{path}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="secret-volumes-info-container">
      <InfoBoxInline message={content} />
    </div>
  );
};

SecretVolumesSection.propTypes = {
  data: PropTypes.shape({
    secrets: PropTypes.arrayOf(
      PropTypes.shape({
        exposures: PropTypes.arrayOf(
          PropTypes.shape({
            type: PropTypes.oneOf(["", "file", "envVar"]),
            value: PropTypes.string,
          })
        ),
        key: PropTypes.string,
        value: PropTypes.string,
      })
    ),
  }).isRequired,
};

export default SecretVolumesSection;

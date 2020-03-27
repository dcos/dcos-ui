import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import * as React from "react";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";

const getForcePullSection = (data, path) => {
  const imageForcePullPath = `${path}.image.forcePull`;
  const imageForcePull = findNestedPropertyInObject(data, imageForcePullPath);

  return (
    <FieldLabel>
      <FieldInput
        checked={imageForcePull}
        name={imageForcePullPath}
        type="checkbox"
        value={imageForcePull}
      />
      <Trans render="span">Force Pull Image On Launch</Trans>
      <FieldHelp>
        <Trans render="span">
          Force Docker to pull the image before launching each instance.
        </Trans>
      </FieldHelp>
    </FieldLabel>
  );
};

const MultiContainerFormAdvancedSection = ({ data, path }) => (
  <div>
    <Trans render="h2" className="short-top short-bottom">
      Advanced Settings
    </Trans>
    <Trans render="p">Advanced settings of the container.</Trans>
    <div className="form-group">{getForcePullSection(data, path)}</div>
  </div>
);

MultiContainerFormAdvancedSection.defaultProps = {
  data: {},
  path: "container",
};

MultiContainerFormAdvancedSection.propTypes = {
  data: PropTypes.object,
  path: PropTypes.string,
};

export default MultiContainerFormAdvancedSection;

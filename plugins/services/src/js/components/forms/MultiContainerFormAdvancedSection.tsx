import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import * as React from "react";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormRow from "#SRC/js/components/form/FormRow";

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

const MultiContainerFormAdvancedSection = ({ data, path }) => {
  const limitsPath = `${path}.limits`;
  return (
    <div>
      <Trans render="h2" className="short-top short-bottom">
        Advanced Settings
      </Trans>
      <Trans render="p">Advanced settings of the container.</Trans>
      <div className="form-group">{getForcePullSection(data, path)}</div>
      <Trans render="h2" className="short-bottom">
        Limits
      </Trans>
      <Trans render="p">Limits settings for cpu and mem.</Trans>
      <FormRow>
        <FormGroup className="column-4">
          <FieldLabel className="text-no-transform">
            <FormGroupHeadingContent>
              <Trans render="span">CPUs</Trans>
            </FormGroupHeadingContent>
          </FieldLabel>
          <FieldInput
            min="0"
            name={`${limitsPath}.cpus`}
            step="0.01"
            type="number"
            value={findNestedPropertyInObject(data, limitsPath + ".cpus")}
          />
        </FormGroup>
        <FormGroup className="column-4">
          <FieldLabel className="text-no-transform">
            <FormGroupHeadingContent>
              <Trans render="span">Memory (MiB)</Trans>
            </FormGroupHeadingContent>
          </FieldLabel>
          <FieldInput
            min="0"
            name={`${limitsPath}.mem`}
            step="any"
            type="number"
            value={findNestedPropertyInObject(data, limitsPath + ".mem")}
          />
        </FormGroup>
      </FormRow>
    </div>
  );
};

MultiContainerFormAdvancedSection.defaultProps = {
  data: {},
  path: "container"
};

MultiContainerFormAdvancedSection.propTypes = {
  data: PropTypes.object,
  path: PropTypes.string
};

export default MultiContainerFormAdvancedSection;

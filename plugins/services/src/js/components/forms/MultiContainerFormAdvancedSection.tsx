import { Trans } from "@lingui/macro";
import PropTypes from "prop-types";
import * as React from "react";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
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
            <FormGroupHeading>
              <FormGroupHeadingContent>
                <Trans render="span">CPUs</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            min="0"
            name={`${limitsPath}.cpus`}
            step="0.01"
            type="number"
            value={
              findNestedPropertyInObject(data, limitsPath + ".cpus.value") ||
              (findNestedPropertyInObject(data, limitsPath + ".cpus.value") ===
              0
                ? 0
                : "")
            }
            disabled={
              findNestedPropertyInObject(
                data,
                limitsPath + ".cpus.unlimited"
              ) === true
            }
          />
          <FieldLabel matchInputHeight={true}>
            <FieldInput
              name={`${limitsPath}.cpus.unlimited`}
              type="checkbox"
              checked={
                !!findNestedPropertyInObject(
                  data,
                  limitsPath + ".cpus.unlimited"
                )
              }
            />
            unlimited
          </FieldLabel>
        </FormGroup>
        <FormGroup className="column-4">
          <FieldLabel className="text-no-transform">
            <FormGroupHeading>
              <FormGroupHeadingContent>
                <Trans render="span">Memory (MiB)</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
          <FieldInput
            min="0"
            name={`${limitsPath}.mem`}
            step="0.01"
            type="number"
            value={
              findNestedPropertyInObject(data, limitsPath + ".mem.value") ||
              (findNestedPropertyInObject(data, limitsPath + ".mem.value") === 0
                ? 0
                : "")
            }
            disabled={
              findNestedPropertyInObject(
                data,
                limitsPath + ".mem.unlimited"
              ) === true
            }
          />
          <FieldLabel matchInputHeight={true}>
            <FieldInput
              name={`${limitsPath}.mem.unlimited`}
              type="checkbox"
              checked={
                !!findNestedPropertyInObject(
                  data,
                  limitsPath + ".mem.unlimited"
                )
              }
            />
            unlimited
          </FieldLabel>
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

import { Trans } from "@lingui/macro";
import * as React from "react";
import PropTypes from "prop-types";

import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FieldSelect from "#SRC/js/components/form/FieldSelect";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FormGroup from "#SRC/js/components/form/FormGroup";

interface Props {
  secretIndex: number;
  variableIndex: number;
  type: string;
}

const SecretExposureTypeSelect = (props: Props) => {
  const { secretIndex, variableIndex, type } = props;
  return (
    <FormGroup className="column-4" required={false}>
      <FieldLabel>
        <FormGroupHeadingContent>
          <Trans render="span">Expose as</Trans>
        </FormGroupHeadingContent>
      </FieldLabel>
      <FieldSelect
        name={`secrets.${secretIndex}.exposures.${variableIndex}.type`}
        type="text"
        value={type || ""}
      >
        <Trans render={<option value="" disabled={true} />}>Select ...</Trans>
        <Trans render={<option value="envVar" />}>Environment Variable</Trans>
        <Trans render={<option value="file" />}>File</Trans>
      </FieldSelect>
    </FormGroup>
  );
};

SecretExposureTypeSelect.propTypes = {
  secretIndex: PropTypes.number.isRequired,
  variableIndex: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
};

export default SecretExposureTypeSelect;

import { Trans } from "@lingui/macro";

import * as React from "react";

import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormRow from "#SRC/js/components/form/FormRow";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";

export default function (props) {
  const { constraint = { value: "" }, index } = props.data;

  return (
    <FormRow>
      <FormGroup>
        <FieldLabel className="column-12">
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true} title="Number of Zones">
              <Trans render="span">Number of Zones</Trans>
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
        <div className="column-3">
          <FieldInput
            name={`constraints.${index}.zone`}
            type="number"
            value={constraint.value}
          />
        </div>
        <FieldHelp className="column-12">
          <Trans render="span">
            Number of zones to evenly distribute instances across.
          </Trans>
        </FieldHelp>
      </FormGroup>
    </FormRow>
  );
}

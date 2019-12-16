import * as React from "react";
import { Trans } from "@lingui/macro";

import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import { FormOutput, FormError } from "./helpers/JobFormData";
import EnvVarPartial from "./EnvVarPartial";

function EnvironmentFormSection(props: {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
}): JSX.Element {
  return (
    <div>
      <h1 className="flush-top short-bottom">
        <FormGroupHeading>
          <FormGroupHeadingContent>
            <Trans render="span">Environment</Trans>
          </FormGroupHeadingContent>
        </FormGroupHeading>
      </h1>
      <Trans render="p">
        Configure any environment values to be attached to each instance that is
        launched.
      </Trans>
      <EnvVarPartial {...props} />
    </div>
  );
}

export default EnvironmentFormSection;

import * as React from "react";
import { Trans } from "@lingui/macro";

import AddButton from "#SRC/js/components/form/AddButton";
import DeleteRowButton from "#SRC/js/components/form/DeleteRowButton";
import FormGroup from "#SRC/js/components/form/FormGroup";
import FormRow from "#SRC/js/components/form/FormRow";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import FormGroupHeading from "#SRC/js/components/form/FormGroupHeading";
import FormGroupHeadingContent from "#SRC/js/components/form/FormGroupHeadingContent";
import FieldAutofocus from "#SRC/js/components/form/FieldAutofocus";
import FieldInput from "#SRC/js/components/form/FieldInput";
import FieldError from "#SRC/js/components/form/FieldError";
import { FormOutput, FormError } from "./helpers/JobFormData";
import { getFieldError } from "./helpers/ErrorUtil";

interface ArgsSectionProps {
  formData: FormOutput;
  errors: FormError[];
  showErrors: boolean;
  onRemoveItem: (path: string, index: number) => void;
  onAddItem: (path: string) => void;
}

class ArgsSection extends React.Component<ArgsSectionProps> {
  constructor(props: ArgsSectionProps) {
    super(props);
  }

  getArgsInputs() {
    const {
      formData: { args },
      onRemoveItem,
      errors,
      showErrors
    } = this.props;

    return args.map((arg: string, index: number) => {
      let label = null;
      if (index === 0) {
        label = (
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                <Trans>Arg</Trans>
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </FieldLabel>
        );
      }
      const argErrors = getFieldError(`job.run.args.${index}`, errors);

      return (
        <FormRow key={index}>
          <FormGroup
            className="column-12"
            required={false}
            showError={Boolean(showErrors && argErrors)}
          >
            {label}
            <FieldAutofocus>
              <FieldInput
                name={`${index}.args`}
                type="text"
                value={arg || ""}
              />
            </FieldAutofocus>
            <FieldError>{argErrors}</FieldError>
          </FormGroup>
          <FormGroup hasNarrowMargins={true} applyLabelOffset={index === 0}>
            <DeleteRowButton onClick={onRemoveItem("args", index)} />
          </FormGroup>
        </FormRow>
      );
    });
  }

  render() {
    const { onAddItem } = this.props;

    return (
      <div className="form-section">
        {this.getArgsInputs()}
        <FormRow>
          <FormGroup className="column-12">
            <AddButton onClick={onAddItem("args")}>
              <Trans>Add Arg</Trans>
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }
}

export default ArgsSection;
